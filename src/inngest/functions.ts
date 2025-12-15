import { inngest } from "./client";
import {
  gemini,
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

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

const MAX_SAFE_TOKENS = 1000;

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("buildlyio-nextjs-test");
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
        });

        for (const message of messages) {
          formattedMessages.push({
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
            type: "text",
          });
        }

        return formattedMessages;
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
      model: openai({
        model: "gpt-4o",
        // defaultParameters: { temperature: 0.5 },
        // model: "gpt-oss-120b",
        baseUrl: "https://openrouter.ai/api/v1",
        defaultParameters: {
          temperature: 0.1,
          max_completion_tokens: MAX_SAFE_TOKENS,
        },
      }),
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
      model: openai({
        model: "gpt-oss-120b",
        baseUrl: "https://openrouter.ai/api/v1",
        defaultParameters: {
          temperature: 0.1,
          max_completion_tokens: 800,
        },
      }),
    });

    const responseGenerator = createAgent<AgentState>({
      name: "response-generator",
      description: "A summary response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-oss-120b",
        baseUrl: "https://openrouter.ai/api/v1",
        defaultParameters: {
          temperature: 0.1,
          max_completion_tokens: 800,
        },
      }),
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
      }else{
        return fragmentTitleOutput[0].content;
      }
    };

    const generateResponse = () => {
      if (responseOutput[0].type !== "text") {
        return "Here you go!";  
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content.map((txt) => txt).join(" ");
      }else{
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

// import { inngest } from "./client";
// import { createAgent, createTool, openai } from "@inngest/agent-kit";
// import { Sandbox } from "@e2b/code-interpreter";
// import { getSandbox, lastAssistantTextMessageContent } from "./utlis";
// import z from "zod";
// import { PROMPT } from "@/prompt";
// import { prisma } from "@/lib/prisma";

// /* ---------------- TYPES ---------------- */

// interface PlanResult {
//   files: string[];
//   needsDependencies: boolean;
// }

// const modelParams = {
//   model: "gpt-4o",
//   baseUrl: "https://openrouter.ai/api/v1",
// }

// /* ---------------- PLANNER ---------------- */

// const plannerAgent = createAgent({
//   name: "planner",
//   system: `
//     You are a planning agent.

//     Analyze the user request and return ONLY valid JSON.
//     Do NOT write code.
//     Do NOT explain.

//     Schema:
//     {
//       "files": string[],
//       "needsDependencies": boolean
//     }
//   `,
//   model: openai({
//     ...modelParams,
//     defaultParameters: {
//       temperature: 0,
//       max_completion_tokens: 200,
//     },
//   }),
// });

// /* ---------------- FUNCTION ---------------- */

// export const codeAgentFunction = inngest.createFunction(
//   { id: "code-agent" },
//   { event: "code-agent/run" },
//   async ({ event, step }) => {
//     /* ---------- Sandbox ---------- */
//     const sandboxId = await step.run("get-sandbox-id", async () => {
//       const sandbox = await Sandbox.create("buildlyio-nextjs-test");
//       return sandbox.sandboxId;
//     });

//     /* ---------- Planner ---------- */
//     const planResult = await plannerAgent.run(event.data.value);

//     // ✅ Now this works, types are correct
//     const planText = lastAssistantTextMessageContent(planResult);

//     if (!planText) {
//       throw new Error("Planner returned no output");
//     }

//     const plan: PlanResult = JSON.parse(planText);
//     /* ---------- File Store ---------- */
//     const generatedFiles: Record<string, string> = {};

//     /* ---------- Executor ---------- */
//     const executorAgent = createAgent({
//       name: "executor",
//       system: `
//         ${PROMPT}

//         You will receive a plan.
//         Follow it strictly.
//         Do NOT re-plan.
//       `,
//       model: openai({
//         ...modelParams,
//         defaultParameters: {
//           temperature: 0.1,
//           max_completion_tokens: 800,
//         },
//       }),
//       tools: [
//         createTool({
//           name: "terminal",
//           description: "Run shell commands",
//           parameters: z.object({
//             command: z.string(),
//           }),
//           handler: async ({ command }) => {
//             const sandbox = await getSandbox(sandboxId);
//             const result = await sandbox.commands.run(command);
//             return result.stdout;
//           },
//         }),
//         createTool({
//           name: "createOrUpdateFiles",
//           description: "Create or update files",
//           parameters: z.object({
//             files: z.array(
//               z.object({
//                 path: z.string(),
//                 content: z.string(),
//               })
//             ),
//           }),
//           handler: async ({ files }) => {
//             const sandbox = await getSandbox(sandboxId);
//             for (const file of files) {
//               await sandbox.files.write(file.path, file.content);
//               generatedFiles[file.path] = file.content;
//             }
//           },
//         }),
//         createTool({
//           name: "readFiles",
//           description: "Read files",
//           parameters: z.object({
//             files: z.array(z.string()),
//           }),
//           handler: async ({ files }) => {
//             const sandbox = await getSandbox(sandboxId);
//             const contents = [];
//             for (const file of files) {
//               const content = await sandbox.files.read(file);
//               contents.push({ path: file, content });
//             }
//             return JSON.stringify(contents);
//           },
//         }),
//       ],
//     });

//     /* ---------- Execute ---------- */
//     const execPrompt = `
//       USER REQUEST:
//       ${event.data.value}

//       PLAN:
//       ${JSON.stringify(plan, null, 2)}
//     `;

//     // ✅ CALL AGENT DIRECTLY
//     const execResult = await executorAgent.run(execPrompt);

//     // ✅ NOW TYPE IS AgentResult
//     const execText = lastAssistantTextMessageContent(execResult);
//     if (!execText) {
//       throw new Error("Executor returned no output");
//     }

//     const summaryMatch = execText.match(
//       /<task_summary>([\s\S]*?)<\/task_summary>/
//     );

//     const summary = summaryMatch?.[1]?.trim();
//     const files = generatedFiles;

//     const isError = !summary || Object.keys(files).length === 0;

//     /* ---------- Sandbox URL ---------- */
//     const sandboxUrl = await step.run("get-sandbox-url", async () => {
//       const sandbox = await getSandbox(sandboxId);
//       return `https://${sandbox.getHost(3000)}`;
//     });

//     /* ---------- Persist ---------- */
//     await step.run("save-result", async () => {
//       if (isError) {
//         return prisma.message.create({
//           data: {
//             projectId: event.data.projectId,
//             content: "Something went wrong. Please try again.",
//             role: "ASSISTANT",
//             type: "ERROR",
//           },
//         });
//       }

//       return prisma.message.create({
//         data: {
//           projectId: event.data.projectId,
//           content: summary!,
//           role: "ASSISTANT",
//           type: "RESULT",
//           fragment: {
//             create: {
//               sandboxUrl,
//               title: "Fragment",
//               files,
//             },
//           },
//         },
//       });
//     });

//     return {
//       url: sandboxUrl,
//       title: "Fragment",
//       files,
//       summary,
//     };
//   }
// );
