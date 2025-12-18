import { inngest } from "./client";
import {
  createAgent,
  createTool,
  createNetwork,
  openai,
  type Tool,
  type Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utlis";
import z from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/prisma";
import { SANBOX_TIMEOUT } from "@/lib/constant";
import { resolveApiKey } from "@/lib/utils.server";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

type ModelParams = {
  model: string;
  apiKey: string;
  baseUrl?: string;
  defaultParameters?: Record<string, unknown>;
};

const MAX_PROMPT_SAFE_TOKENS = 1000;
const MAX_TEXT_GENERATION_SAFE_TOKENS = 800;

function getModelParams(provider: string, apiKey: string, type: "RESPONSE_PROMPT" | "PROMPT" | "FRAGMENT_TITLE_PROMPT"): ModelParams  {
  let modelParams = {}
  if (provider === "OPENAI") {
    modelParams = {
      model: type === "PROMPT" ? "gpt-4.1" : "gpt-4o",
      defaultParameters: {
        temperature: 0.1,
      },
      apiKey: apiKey,
    };
  }else if (provider === "OPENROUTER") {
    modelParams = {
      model: type === "PROMPT" ? "gpt-4o" : "gpt-oss-120b",
      defaultParameters: {
        temperature: 0.1,
        max_completion_tokens: type === "PROMPT" ? MAX_PROMPT_SAFE_TOKENS : MAX_TEXT_GENERATION_SAFE_TOKENS,
      },
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    };
  }

  return modelParams as ModelParams;
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const { provider, apiKey } = await resolveApiKey(event.data.userId);
    console.log(provider, apiKey);

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("buildlyio-nextjs-test");
      await sandbox.setTimeout(SANBOX_TIMEOUT);
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        });

        for (const message of messages) {
          formattedMessages.push({
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
            type: "text",
          });
        }

        return formattedMessages.reverse();
      }
    );

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      }
    );

    //To Do: In user profile we will link his open ai key if he has addded and if addedd then we
    // will conditionally pass that specific object which has model name and other part in openai function
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai(getModelParams(provider, apiKey, "PROMPT")),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });

                return result.stdout;
              } catch (error) {
                console.log(
                  `Command failed: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`
                );
                return `Command failed: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  return `Error: ${error}`;
                }
              }
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (error) {
                return `Error: ${error}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const summary = network.state.data.summary as unknown as any;

        if (summary) {
          return summary;
        }

        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, {
      state: state,
    });

    const fragmentTitleGenerator = createAgent<AgentState>({
      name: "fragment-title-generator",
      description: "Generates a title for a fragment",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai(getModelParams(provider, apiKey, "FRAGMENT_TITLE_PROMPT")),
    });

    const responseGenerator = createAgent<AgentState>({
      name: "response-generator",
      description: "A summary response generator",
      system: RESPONSE_PROMPT,
      model: openai(getModelParams(provider, apiKey, "RESPONSE_PROMPT")),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const generateFragmentTitle = () => {
      if (fragmentTitleOutput[0].type !== "text") {
        return "Fragment";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((txt) => txt).join(" ");
      } else {
        return fragmentTitleOutput[0].content;
      }
    };

    const generateResponse = () => {
      if (responseOutput[0].type !== "text") {
        return "Here you go!";
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content.map((txt) => txt).join(" ");
      } else {
        return responseOutput[0].content;
      }
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("savce-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: generateFragmentTitle(),
      files: result.state.data.files,
      summary: generateResponse(),
    };
  }
);
