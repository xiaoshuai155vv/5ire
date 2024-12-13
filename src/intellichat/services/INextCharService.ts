import { IChatContext, IChatRequestMessage } from "intellichat/types";
import { IServiceProvider } from "providers/types";

export default interface INextChatService {
  context: IChatContext;
  provider: IServiceProvider;
  apiSettings: {
    base: string;
    key: string;
    model: string;
    secret?:string; // baidu
    deploymentId?:string; // azure
  };
  chat(message:IChatRequestMessage[]):void;
  abort():void;
  isReady(): boolean;
  onComplete(callback: (result: any) => void): void;
  onToolCalling(callback: (toolName: string) => void): void;
  onReading(callback: (chunk: string) => void): void;
  onError(callback: (error: any, aborted: boolean) => void): void;
}
