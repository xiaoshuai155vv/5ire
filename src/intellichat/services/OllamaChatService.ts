import Debug from 'debug';
import Ollama from '../../providers/Ollama';
import {
  IChatContext,
  IChatRequestMessage,
  IChatResponseMessage,
} from 'intellichat/types';
import INextChatService from './INextCharService';
import OpenAIChatService from './OpenAIChatService';

const debug = Debug('5ire:intellichat:OllamaChatService');
export default class OllamaChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(context: IChatContext) {
    super(context);
    this.provider = Ollama;
  }

  protected parseReply(chunk: string): IChatResponseMessage {
    const data = JSON.parse(chunk);
    if (data.done) {
      return {
        content: data.message.content,
        isEnd: true,
        inputTokens: data.prompt_eval_count,
        outputTokens: data.eval_count,
      };
    }
    return {
      content: data.message.content,
      isEnd: false,
      toolCalls: data.tool_calls,
    };
  }


  protected async makeRequest(
    messages: IChatRequestMessage[]
  ): Promise<Response> {
    const payload = await this.makePayload(messages);
    debug('Send Request, payload:\r\n', payload);
    const { base } = this.apiSettings;
    const response = await fetch(`${base}/api/chat`, {
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
