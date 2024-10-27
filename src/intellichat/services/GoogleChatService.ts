import { IGeminiChatRequestMessageContent } from '../types';
import { Text } from '@fluentui/react-components';
import Debug from 'debug';
import IChatService from './IChatService';
import {
  IChatContext,
  IChatResponseMessage,
  IChatRequestMessage,
  IChatRequestPayload,
} from 'intellichat/types';
import BaseChatService from './BaseChatService';
import { isBlank } from 'utils/validators';
import Google from 'providers/Google';
import { getBase64, splitByImg, stripHtmlTags } from 'utils/util';

const debug = Debug('5ire:intellichat:GoogleChatService');

const containsImage = (contents: IChatRequestMessage[]): boolean => {
  if (contents?.length) {
    const prompt = contents[contents.length - 1];
    return !!prompt.parts?.some((part) => 'inline_data' in part);
  }
  return false;
};

export default class GoogleChatService
  extends BaseChatService
  implements IChatService
{
  constructor(context: IChatContext) {
    super({
      context,
      provider: Google,
    });
  }

  protected async composePromptMessage(
    content: string
  ): Promise<IGeminiChatRequestMessageContent[]> {
    if (this.context.getModel().vision?.enabled) {
      const items = splitByImg(content, true);
      const result: IGeminiChatRequestMessageContent[] = [];
      for(let item of items){
        if (item.type === 'image') {
          if(item.dataType === 'url'){
            result.push({
              inline_data: {
                mimeType: item.mimeType,
                data: await getBase64(item.data),
              },
            });
          }else{
            result.push({
              inline_data: {
                mimeType: item.mimeType as string,
                data: item.data
              },
            });
          }
        } else if (item.type === 'text') {
          result.push({
            text: item.data,
          });
        } else {
          console.error('Unknown message type', item);
          throw new Error('Unknown message type');
        }
      }
      return result;
    }
    return Promise.resolve([{ text: stripHtmlTags(content) }]);
  }

  /**
   *
   * 由于  gemini-pro-vision  不支持多轮对话，因此如果提示词包含图片，则不包含历史信息。
   */
  private async composeMessages(
    message: string
  ): Promise<IChatRequestMessage[]> {
    const result = [];
    const prompt = {
      role: 'user',
      parts: await this.composePromptMessage(message),
    };
    if (!containsImage([prompt])) {
      const systemMessage = this.context.getSystemMessage();
      if (!isBlank(systemMessage)) {
        result.push({
          role: 'user',
          parts: [{ text: systemMessage }],
        });
      }
      for (let msg of this.context.getCtxMessages()) {
        result.push({
          role: 'user',
          parts: [{ text: msg.prompt }],
        });
        result.push({
          role: 'model',
          parts: [
            {
              text: msg.reply,
            },
          ],
        });
      }
    }
    result.push(prompt);
    return result as IChatRequestMessage[];
  }

  protected async makePayload(message: string): Promise<IChatRequestPayload> {
    const payload: IChatRequestPayload = {
      contents: await this.composeMessages(message),
      generationConfig: {
        temperature: this.context.getTemperature(),
      },
    };
    const maxOutputTokens = this.context.getMaxTokens();
    if (payload.generationConfig && maxOutputTokens) {
      payload.generationConfig.maxOutputTokens = maxOutputTokens;
    }
    debug('payload', payload);
    return payload;
  }

  protected parseReplyMessage(chunk: string): IChatResponseMessage[] {
    const matches = /"text": "(.*)"/g.exec(chunk);
    if (matches) {
      return [{ content: matches[1].replace(/\\n/g, '\n') }];
    }
    return [];
  }

  protected async makeRequest(message: string): Promise<Response> {
    const payload = await this.makePayload(message);
    const isStream = this.context.isStream();
    debug(
      `About to make a request,stream:${isStream},  payload: ${payload}\r\n`
    );
    const { base, key } = this.apiSettings;
    /**
     * 特殊处理，因为如果选用vision模型，但内容中没有图片会出现异常
     * 所以如果选用 vision 模型，但没有提供图片内容，则调用 gemini-pro
     */
    const model = containsImage(payload.contents as IChatRequestMessage[])
      ? 'gemini-pro-vision'
      : 'gemini-pro';
    const response = await fetch(
      `${base}/v1beta/models/${model}:${
        isStream ? 'streamGenerateContent' : 'generateContent'
      }?key=${key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: this.abortController.signal,
      }
    );
    return response;
  }
}
