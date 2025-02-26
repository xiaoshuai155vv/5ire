import OpenAIChatService from './OpenAIChatService';
import Doubao from '../../providers/Doubao';
import { IChatContext, IChatRequestMessage } from 'intellichat/types';
import INextChatService from './INextCharService';
import { urlJoin } from 'utils/util';

export default class DoubaoChatService
  extends OpenAIChatService
  implements INextChatService {
  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = Doubao;
  }

  protected async makeRequest(
    messages: IChatRequestMessage[]
  ): Promise<Response> {
    const { base, deploymentId, key } = this.apiSettings;
    const payload = await this.makePayload(messages);
    payload.model = deploymentId;
    payload.stream = true;
    const url = urlJoin('/api/v3/chat/completions', base);
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    });
    return response;
  }
}
