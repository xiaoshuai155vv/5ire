import {
  encoding_for_model as encodingForModel,
  TiktokenModel,
  Tiktoken,
} from 'tiktoken';
import { get_encoding as getEncoding } from 'tiktoken/init';
import { IChatRequestMessage } from 'intellichat/types';
import { captureException } from 'renderer/logging';

let llama3Tokenizer: any;
let llamaTokenizer: any;

(async () => {
  llama3Tokenizer = (await import('llama3-tokenizer-js')).default;
  llamaTokenizer = (await import('llama-tokenizer-js')).default;
})();

export function countGPTTokens(messages: IChatRequestMessage[], model: string) {
  let _model = model;
  if (model.startsWith('gpt-3.5') || model.startsWith('gpt-35')) {
    _model = 'gpt-3.5-turbo-0613';
  } else if (model.startsWith('gpt-4')) {
    _model = 'gpt-4-0613';
  }
  let encoding: Tiktoken;
  try {
    encoding = encodingForModel(_model as TiktokenModel);
  } catch (err) {
    console.warn('Model not found. Using cl100k_base encoding.');
    encoding = getEncoding('cl100k_base');
  }
  const tokensPerMessage = 3;
  const tokensPerName = 1;
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
  model: string,
) {
  const response = await fetch(
    `${apiBase}/v1beta/models/${model}:countTokens?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents: messages }),
    },
  );
  const data = await response.json();
  return data.totalTokens;
}

export async function countTokensOfMoonshot(
  messages: IChatRequestMessage[],
  apiBase: string,
  apiKey: string,
  model: string,
) {
  try {
    const response = await fetch(`${apiBase}/tokenizers/estimate-token-count`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
    });
    const json = await response.json();
    return json.data.total_tokens;
  } catch (err: any) {
    captureException(err);
    return 0;
  }
}

export async function countTokenOfLlama(
  messages: IChatRequestMessage[],
  model: string,
) {
  const tokensPerMessage = 3;
  const tokensPerName = 1;
  let numTokens = 0;
  const tokenizer = model.startsWith('llama3')
    ? llama3Tokenizer
    : llamaTokenizer;
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
