import OpenAIChatService from './OpenAIChatService';
import DeepSeek from '../../providers/DeepSeek';
import { IChatContext, IChatRequestMessage } from 'intellichat/types';
import INextChatService from './INextCharService';
import { urlJoin } from 'utils/util';

export default class DeepSeekChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = DeepSeek;
  }

  protected async makeRequest(
    messages: IChatRequestMessage[],
  ): Promise<Response> {
    const { base, key } = this.apiSettings;
    const url = urlJoin('/chat/completions', base)
    const response = await fetch(url, {
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
