import OpenAIChatService from './OpenAIChatService';
import DeepSeek from '../../providers/DeepSeek';
import { IChatContext, IChatRequestMessage } from 'intellichat/types';
import INextChatService from './INextCharService';

export default class DeepSeekChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = DeepSeek;
  }

  protected async makeRequest(
    messages: IChatRequestMessage[]
  ): Promise<Response> {
    const { base, key } = this.apiSettings;
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(await this.makePayload(messages)),
      signal: this.abortController.signal,
    });
    return response;
  }
}
