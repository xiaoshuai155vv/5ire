import IChatService from './IChatService';
import OpenAIChatService from './OpenAIChatService';
import Azure from '../../providers/Azure'
import { IChatContext } from 'intellichat/types';


export default class AzureChatService
  extends OpenAIChatService
  implements IChatService
{

  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = Azure;
  }

  protected async makeRequest(message: string): Promise<Response> {
    const apiVersion = '2023-03-15-preview';
    const { base, deploymentId, key } = this.apiSettings;
    const response = await fetch(
      `${base}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': key,
        },
        body: JSON.stringify(await this.makePayload(message)),
        signal: this.abortController.signal,
      }
    );
    return response;
  }
}
