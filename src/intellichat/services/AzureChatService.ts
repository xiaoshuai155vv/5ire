import OpenAIChatService from './OpenAIChatService';
import Azure from '../../providers/Azure'
import { IChatContext, IChatRequestMessage } from 'intellichat/types';
import INextChatService from './INextCharService';


export default class AzureChatService
  extends OpenAIChatService
  implements INextChatService {

  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = Azure;
  }

  protected async makeRequest(messages: IChatRequestMessage[]): Promise<Response> {
    const apiVersion = '2024-10-21';
    const { base, deploymentId, key } = this.apiSettings;
    const url = new URL(`/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`, base);
    const response = await fetch(
      url.toString(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': key,
        },
        body: JSON.stringify(await this.makePayload(messages)),
        signal: this.abortController.signal,
      }
    );
    return response;
  }
}
