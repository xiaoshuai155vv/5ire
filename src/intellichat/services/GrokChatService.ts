import OpenAIChatService from './OpenAIChatService';
import Grok from '../../providers/Grok';
import { IChatContext, IChatRequestMessage } from 'intellichat/types';
import INextChatService from './INextCharService';

export default class GrokChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = Grok;
  }
}
