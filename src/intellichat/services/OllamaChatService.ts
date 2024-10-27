import Debug from 'debug';
import IChatService from './IChatService';
import Ollama from '../../providers/Ollama';
import {
  IChatContext,
  IChatRequestPayload,
  IChatResponseMessage,
} from 'intellichat/types';
import BaseChatService from './BaseChatService';
import { isBlank } from 'utils/validators';

const debug = Debug('5ire:intellichat:OllamaChatService');

export default class OllamaChatService
  extends BaseChatService
  implements IChatService
{
  constructor(context: IChatContext) {
    super({ context, provider: Ollama });
  }

  protected async makePayload(message: string): Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      model: this.context.getModel().name,
      prompt: this.composePromptMessage(message) as string,
      options: {
        temperature: this.context.getTemperature(),
      },
      stream: true,
    };
    const systemMessage = this.context.getSystemMessage();
    if (!isBlank(systemMessage)) {
      payload.system = systemMessage as string;
    }
    const chatCtx = this.context.getChatContext();
    if (chatCtx) {
      payload.context = JSON.parse(chatCtx);
    }
    const maxTokens = this.context.getMaxTokens();
    if (maxTokens) {
      payload.max_tokens = maxTokens;
    }
    return Promise.resolve(payload);
  }

  protected parseReplyMessage(chunk: string): IChatResponseMessage[] {
    try {
      const data = JSON.parse(chunk);
      if (!!data.done) {
        return [
          {
            content: data.response,
            isEnd: true,
            inputTokens: data.prompt_eval_count,
            outputTokens: data.eval_count,
            context: data.context,
          },
        ];
      }
      return [
        {
          content: data.response,
          isEnd: false,
        },
      ];
    } catch (error) {
      console.error(error, chunk);
      return [
        {
          content: '',
          isEnd: false,
        },
      ];
    }
  }

  protected async makeRequest(message: string): Promise<Response> {
    const payload = await this.makePayload(message);
    debug('Send Request, payload:\r\n', payload);
    const { base } = this.apiSettings;
    const response = await fetch(`${base}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    });
    return response;
  }
}
