export type MessageRole = "USER" | "ASSISTANT";

export type MessageType = "RESULT" | "ERROR";

export interface Fragment {
  id: string;
  messageId: string;
  sandboxUrl: string;
  title: string;
  files: any;
  createdAt: Date;
  updatedAt: Date;
}

export type TreeItem = string | [string, ...TreeItem[]];