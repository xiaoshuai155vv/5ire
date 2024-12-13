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

const MAX_CONCAT_TIMES = 2;

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
  private onCompleteCallback: (result: any) => void;
  private onReadingCallback: (chunk: string) => void;
  private onToolCallingCallback: (toolName: string) => void;
  private onErrorCallback: (error: any, aborted: boolean) => void;
  private tool: ITool | null = null;
  private inputTokens: number = 0;
  private outputTokens: number = 0;

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

  protected abstract makePayload(messages: IChatRequestMessage[]): Promise<IChatRequestPayload>;
  protected abstract makeRequest(messages: IChatRequestMessage[]): Promise<Response>;

  /**
   * 由于可能出现一条 message 实际上是多条回复，所以返回数组
   * @param message
   * @return parsedMessages IParsedMessage[]
   */
  protected abstract parseReply(message: string): IChatResponseMessage[];

  protected abstract parseTools(chunk: string): ITool | null;
  protected abstract parseToolArgs(chunk: string): string;

  public onComplete(callback: (result: any) => void) {
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

  protected composePromptMessage(
    content: string
  ):
    | string
    | IChatRequestMessageContent[]
    | IChatRequestMessageContent[]
    | IGeminiChatRequestMessageContent[]
    | Promise<
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

    let signal = null;
    let reader = null;
    let reply = '';
    let context: any = null;

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
      // Read the response as a stream of data
      reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Error occurred while generating.');
      }
      const decoder = new TextDecoder('utf-8');
      let isFunction = false;
      let functionArgs = '';
      let index = 0;
      let done = false;
      while (!done) {
        if (this.aborted) {
          break;
        }
        /* eslint-disable no-await-in-loop */
        const data = await reader.read();
        done = data.done || false;
        const value = decoder.decode(data.value);
        if (response.status !== 200) {
          this.onReadingError(value);
        }
        const chunks = value
          .split('\n')
          .map((i) => i.trim())
          .filter((i) => i !== '');
        for (const chunk of chunks) {
          if (chunk === 'data: [DONE]') {
            done = true;
            break;
          }
          if (index === 0) {
            const tool = this.parseTools(chunk);
            if (tool) {
              this.tool = {
                id: tool.id,
                name: tool.name,
              };
              this.onToolCallingCallback(this.tool.name);
              isFunction = true;
              context;
            }
          }
          if (isFunction) {
            functionArgs += this.parseToolArgs(chunk);
          } else {
            const messages: IChatResponseMessage[] = this.parseReply(chunk);
            // eslint-disable-next-line no-plus
            for (let i = 0; i < messages.length; i++) {
              const message = messages[i];
              reply += message.content;
              this.onReadingCallback(message.content || '');
              if (message.outputTokens) {
                this.outputTokens += message.outputTokens;
              }
              if (message.isEnd) {
                // inputToken 不会变化，所以只取最后一次的值
                if (message.inputTokens) {
                  this.inputTokens = message.inputTokens;
                }
                context = message.context || null; // ollama 最后会输出 context 信息
                done = true;
              }
            }
          }
          index++;
        }
      }

      if (this.tool) {
        this.tool.args = JSON.parse(functionArgs);
        const [client, name] = this.tool.name.split('-000-');
        const result = await window.electron.mcp.callTool({
          client,
          name,
          args: this.tool.args,
        });
      } else {
        await this.onCompleteCallback({
          content: reply,
          context: context,
          inputTokens: this.outputTokens,
          outputTokens: this.outputTokens,
        });
      }
    } catch (error: any) {
      this.onErrorCallback(error, !!signal?.aborted || !!this.aborted);
      await this.onCompleteCallback({
        content: reply,
        context: context,
        inputTokens: this.outputTokens,
        outputTokens: this.outputTokens,
        error: {
          code: error.code || 500,
          message: error.message || error.toString(),
        },
      });
    }
  }
}
