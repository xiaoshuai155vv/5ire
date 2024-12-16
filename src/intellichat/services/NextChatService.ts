import Debug from 'debug';
import {
  IChatContext,
  IChatRequestMessage,
  IChatRequestMessageContent,
  IChatRequestPayload,
  IChatResponseMessage,
  IGeminiChatRequestMessageContent,
} from 'intellichat/types';
import { IServiceProvider } from 'providers/types';
import useSettingsStore from 'stores/useSettingsStore';
import { raiseError, stripHtmlTags } from 'utils/util';

const debug = Debug('5ire:intellichat:NextChatService');

export interface ITool {
  id: string;
  name: string;
  args?: any;
}

export default abstract class NextCharService {
  abortController: AbortController;
  context: IChatContext;
  provider: IServiceProvider;
  apiSettings: {
    base: string;
    key: string;
    model: string;
    secret?: string; // baidu
    deploymentId?: string; // azure
  };
  aborted: boolean;
  protected onCompleteCallback: (result: any) => Promise<void>;
  protected onReadingCallback: (chunk: string) => void;
  protected onToolCallingCallback: (toolName: string) => void;
  protected onErrorCallback: (error: any, aborted: boolean) => void;
  protected usedToolNames: string[] = [];
  protected tool: ITool | null = null;
  protected inputTokens: number = 0;
  protected outputTokens: number = 0;

  constructor({
    context,
    provider,
  }: {
    context: IChatContext;
    provider: IServiceProvider;
  }) {
    this.apiSettings = useSettingsStore.getState().api;
    this.provider = provider;
    this.context = context;
    this.abortController = new AbortController();
    this.aborted = false;

    this.onCompleteCallback = () => {
      throw new Error('onCompleteCallback is not set');
    };
    this.onToolCallingCallback = () => {
      throw new Error('onToolCallingCallback is not set');
    };
    this.onReadingCallback = () => {
      throw new Error('onReadingCallback is not set');
    };
    this.onErrorCallback = () => {
      throw new Error('onErrorCallback is not set');
    };
  }

  protected abstract makePayload(
    messages: IChatRequestMessage[]
  ): Promise<IChatRequestPayload>;
  protected abstract makeRequest(
    messages: IChatRequestMessage[]
  ): Promise<Response>;

  protected abstract read(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    status: number,
    decoder: TextDecoder,
    onProgress: (content: string) => void
  ): Promise<{ reply: string; context: any }>;
  /**
   * 由于可能出现一条 message 实际上是多条回复，所以返回数组
   * @param message
   * @return parsedMessages IParsedMessage[]
   */
  protected abstract parseReply(message: string): IChatResponseMessage;
  protected abstract parseTools(respMsg: IChatResponseMessage): ITool | null;
  protected abstract parseToolArgs(respMsg: IChatResponseMessage): {
    index: number;
    args: string;
  };

  public onComplete(callback: (result: any) => Promise<void>) {
    this.onCompleteCallback = callback;
  }
  public onReading(callback: (chunk: string) => void) {
    this.onReadingCallback = callback;
  }

  public onToolCalling(callback: (toolName: string) => void) {
    this.onToolCallingCallback = callback;
  }

  public onError(callback: (error: any, aborted: boolean) => void) {
    this.onErrorCallback = callback;
  }

  protected onReadingError(chunk: string) {
    try {
      const { error } = JSON.parse(chunk);
      console.error(error);
    } catch (err) {
      throw new Error(`Something went wrong`);
    }
  }

  protected async convertPromptContent(
    content: string
  ): Promise<
    | string
    | IChatRequestMessageContent[]
    | IChatRequestMessageContent[]
    | IGeminiChatRequestMessageContent[]
  > {
    return stripHtmlTags(content);
  }

  public abort() {
    this.abortController?.abort();
    this.aborted = true;
  }

  public isReady(): boolean {
    const { apiSchema } = this.provider.chat;
    if (apiSchema.includes('model') && !this.apiSettings.model) {
      return false;
    }
    if (apiSchema.includes('base') && !this.apiSettings.base) {
      return false;
    }
    if (apiSchema.includes('key') && !this.apiSettings.key) {
      return false;
    }
    return true;
  }

  public async chat(messages: IChatRequestMessage[]) {
    this.abortController = new AbortController();
    this.aborted = false;
    let reply = '';
    let context = null;
    let signal = null;
    try {
      signal = this.abortController.signal;
      const response = await this.makeRequest(messages);
      debug(response, response.status, response.statusText);
      if (response.status !== 200) {
        const contentType = response.headers.get('content-type');
        let msg, json;
        if (contentType?.includes('application/json')) {
          json = await response.json();
        } else {
          msg = await response.text();
        }
        raiseError(response.status, json, msg);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Error occurred while generating.');
      }
      const decoder = new TextDecoder('utf-8');
      await this.read(reader, response.status, decoder, (content) => {
        reply += content;
      });
      if (this.tool) {
        const [client, name] = this.tool.name.split('--');
        const result = await window.electron.mcp.callTool({
          client,
          name,
          args: this.tool.args,
        });
        const _messages = [
          ...messages,
          {
            role: 'assistant',
            tool_calls: [
              {
                id: this.tool.id,
                type: 'function',
                function: {
                  arguments: JSON.stringify(this.tool.args),
                  name: this.tool.name,
                },
              },
            ],
          },
          {
            role: 'tool',
            name: this.tool.name,
            content: result.content,
            tool_call_id: this.tool.id,
          },
        ] as IChatRequestMessage[];
        await this.chat(_messages);
      } else {
        await this.onCompleteCallback({
          content: reply,
          context: context,
          inputTokens: this.inputTokens,
          outputTokens: this.outputTokens,
        });
        this.inputTokens = 0;
        this.outputTokens = 0;
      }
    } catch (error: any) {
      this.onErrorCallback(error, !!signal?.aborted || !!this.aborted);
      await this.onCompleteCallback({
        content: reply,
        context: context,
        inputTokens: this.inputTokens,
        outputTokens: this.outputTokens,
        error: {
          code: error.code || 500,
          message: error.message || error.toString(),
        },
      });
      this.inputTokens = 0;
      this.outputTokens = 0;
    }
  }
}
