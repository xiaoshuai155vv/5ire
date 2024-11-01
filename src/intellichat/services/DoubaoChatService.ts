import IChatService from './IChatService';
import OpenAIChatService from './OpenAIChatService';
import Doubao from '../../providers/Doubao';
import { IChatContext } from 'intellichat/types';

export default class DoubaoChatService
  extends OpenAIChatService
  implements IChatService
{
  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = Doubao;
  }


  protected async makeRequest(message: string): Promise<Response> {
    const { base, deploymentId, key } = this.apiSettings;
    const payload = await this.makePayload(message)
    payload.model = deploymentId
    payload.stream = true
    const response = await fetch(`${base}/api/v3/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    });
    return response;
  }
}
