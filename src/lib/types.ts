export type MessageRole = "USER" | "ASSISTANT";

export type MessageType = "RESULT" | "ERROR";

export interface Fragment {
  id: string;
  messageId: string;
  sandboxUrl: string;
  title: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files: any;
  createdAt: Date;
  updatedAt: Date;
}

export type TreeItem = string | [string, ...TreeItem[]];