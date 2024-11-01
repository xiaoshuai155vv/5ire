import {
  encoding_for_model as encodingForModel,
  TiktokenModel,
  Tiktoken,
} from 'tiktoken';
import { get_encoding as getEncoding, } from "tiktoken/init";
import { IChatRequestMessage } from 'intellichat/types';

let llama3Tokenizer: any;
let llamaTokenizer: any;

(async () => {
  llama3Tokenizer = await import('llama3-tokenizer-js');
  llamaTokenizer = await import('llama-tokenizer-js');
})();

export function countGPTTokens(messages: IChatRequestMessage[], model: string) {
  let encoding: Tiktoken;
  try {
    encoding = encodingForModel(model as TiktokenModel);
  } catch (err) {
    console.warn('Model not found. Using cl100k_base encoding.');
    encoding = getEncoding('cl100k_base');
  }

  let tokensPerMessage: number;
  let tokensPerName: number;

  if (
    [
      'gpt-3.5-turbo-0613',
      'gpt-3.5-turbo-16k-0613',
      'gpt-4-0314',
      'gpt-4-32k-0314',
      'gpt-4-0613',
      'gpt-4-32k-0613',
      // doubao
      'doubao-pro-256k',
      'doubao-pro-128k',
      'doubao-pro-32k',
      'doubao-pro-4k',
      'doubao-lite-128k',
      'doubao-lite-32k',
      'doubao-lite-4k',
    ].includes(model)
  ) {
    tokensPerMessage = 3;
    tokensPerName = 1;
  } else if (model === 'gpt-3.5-turbo-0301') {
    tokensPerMessage = 4;
    tokensPerName = -1;
  } else if (model.startsWith('gpt-3.5') || model.startsWith('gpt-35')) {
    console.warn('Assuming gpt-3.5-turbo-0613 tokenization.');
    return countGPTTokens(messages, 'gpt-3.5-turbo-0613');
  } else if (model.startsWith('gpt-4')) {
    console.warn('Assuming gpt-4-0613 tokenization.');
    return countGPTTokens(messages, 'gpt-4-0613');
  } else {
    throw new Error(`numTokensFromMessages not implemented for ${model}`);
  }

  let numTokens = 0;

  messages.forEach((msg: any) => {
    numTokens += tokensPerMessage;
    Object.keys(msg).forEach((key: string) => {
      numTokens += encoding.encode(msg[key] as string).length;
      if (key === 'name') {
        numTokens += tokensPerName;
      }
    });
  });
  numTokens += 3; // For assistant prompt

  return numTokens;
}

export async function countTokensOfGemini(
  messages: IChatRequestMessage[],
  apiBase: string,
  apiKey: string,
  model: string
) {
  const response = await fetch(
    `${apiBase}/v1beta/models/${model}:countTokens?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents: messages }),
    }
  );
  const data = await response.json();
  return data.totalTokens;
}

export async function countTokensOfMoonshot(
  messages: IChatRequestMessage[],
  apiBase: string,
  apiKey: string,
  model: string
) {
  const response = await fetch(
    `${apiBase}/v1/tokenizers/estimate-token-count`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
    }
  );
  const json = await response.json();
  return json.data.total_tokens;
}

export async function countTokenOfLlama(
  messages: IChatRequestMessage[],
  model: string
) {
  const tokensPerMessage = 3;
  const tokensPerName = 1;
  let numTokens = 0;
  let tokenizer = model.startsWith('llama3') ? llama3Tokenizer : llamaTokenizer;
  messages.forEach((msg: any) => {
    numTokens += tokensPerMessage;
    Object.keys(msg).forEach((key: string) => {
      numTokens += tokenizer.encode(msg[key] as string).length;
      if (key === 'name') {
        numTokens += tokensPerName;
      }
    });
  });
  return numTokens;
}
