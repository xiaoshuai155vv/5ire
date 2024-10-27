import Debug from 'debug';
import IChatService from './IChatService';
import { isWebUri } from 'valid-url';
import {
  IChatContext,
  IChatResponseMessage,
  IChatRequestPayload,
  IChatRequestMessageContent,
  IGeminiChatRequestMessageContent,
} from '../types';
import { IServiceProvider, IChatModel } from '../../providers/types';
import useSettingsStore from '../../stores/useSettingsStore';
import { raiseError, stripHtmlTags } from 'utils/util';

const debug = Debug('5ire:intellichat:BaseChatService');

export default abstract class BaseChatService implements IChatService {
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
  }

  protected abstract makePayload(message: string): Promise<IChatRequestPayload>;
  protected abstract makeRequest(message: string): Promise<Response>;

  protected onMessageError(chunk: string) {
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

  /**
   * 由于可能出现一条 message 实际上是多条回复，所以返回数组
   * @param message
   * @return parsedMessages IParsedMessage[]
   */
  protected abstract parseReplyMessage(message: string): IChatResponseMessage[];


  public abort() {
    this.abortController?.abort();
    this.aborted = true;
  }

  public isReady(): boolean {
    const {apiSchema} = this.provider.chat;
    if(apiSchema.includes('model') && !this.apiSettings.model) {
      return false
    }
    if(apiSchema.includes('base') && !this.apiSettings.base) {
      return false
    }
    if(apiSchema.includes('key') && !this.apiSettings.key) {
      return false
    }
    return true;
  }

  public async chat({
    message,
    onMessage,
    onComplete,
    onError,
  }: {
    message: string;
    onMessage: (message: string) => void;
    onComplete: (result: IChatResponseMessage) => Promise<void>;
    onError: (error: any, aborted: boolean) => void;
  }) {
    this.abortController = new AbortController();
    this.aborted = false;

    let signal = null;
    let reader = null;
    let reply = '';
    let context:any = null;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    try {
      signal = this.abortController.signal;
      const response = await this.makeRequest(message);
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
      let done = false;
      while (!done) {
        if(this.aborted){
          break;
        }
        /* eslint-disable no-await-in-loop */
        const data = await reader.read();
        done = data.done || false;
        const chunk = decoder.decode(data.value);
        if (response.status !== 200) {
          this.onMessageError(chunk);
        }
        const messages: IChatResponseMessage[] = this.parseReplyMessage(chunk);
        // eslint-disable-next-line no-plus
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          reply += message.content;
          if (message.outputTokens) {
            totalOutputTokens += message.outputTokens;
          }
          onMessage(message.content || '');
          if (message.isEnd) {
            // inputToken 不会变化，所以只取最后一次的值
            if (message.inputTokens) {
              totalInputTokens = message.inputTokens;
            }
            context = message.context || null; // ollama 最后会输出 context 信息
            done = true;
          }
        }
      }
      await onComplete({
        content: reply,
        context: context,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      });
    } catch (error: any) {
      onError(error, !!signal?.aborted||!!this.aborted);
      await onComplete({
        content: reply,
        context: context,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        error: {
          code: error.code || 500,
          message: error.message || error.toString(),
        },
      });
    }
  }
}
