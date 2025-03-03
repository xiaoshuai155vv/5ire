import OpenAIChatService from './OpenAIChatService';
import LMStudio from '../../providers/LMStudio';
import { IChatContext, IChatRequestMessage } from 'intellichat/types';
import INextChatService from './INextCharService';
import { urlJoin } from 'utils/util';

export default class LMStudioChatService
  extends OpenAIChatService
  implements INextChatService {
  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = LMStudio;
  }

  protected async makeRequest(
    messages: IChatRequestMessage[],
  ): Promise<Response> {
    const { base, key } = this.apiSettings;
    const url = urlJoin('/chat/completions', base)
    const response = await fetch(url.toString(), {
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
