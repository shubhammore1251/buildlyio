import { projectsRouter } from "@/modules/projects/server/procedures";
import {  createTRPCRouter } from "../init";
import { messagesRouter } from "@/modules/messages/server/procedures";
import { usageRouter } from "@/modules/usage/server/procedure";
import { apiKeysRouter } from "@/modules/apikeys/server/procedure";

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
  usages: usageRouter,
  apikeys: apiKeysRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
