import { describe, expect, test } from '@jest/globals';
import OpenAIReader from '../../src/intellichat/readers/OpenAIReader';
import AnthropicReader from '../../src/intellichat/readers/AnthropicReader';

const anthropicResponse=`data: {"type": "message_start", "message": {"id": "msg_1nZdL29xx5MUA1yADyHTEsnR8uuvGzszyY", "type": "message", "role": "assist
ant", "content": [], "model": "claude-3-5-sonnet-20241022", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 25, "output_tokens": 1}}}
data: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}data: {"type": "ping"}
data: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "He
llo"}}data: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "!"}}
data: {"type": "content_block_stop", "index": 0}
data: {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_se
quence":null}, "usage": {"output_tokens": 15}}data: {"type": "message_stop"}`;

const anthropicResponseTools = `data: {"type":"message_start","message":{"id":"msg_014p7gG3wDgGV9EUtLvnow3U","type":"message","role":"assistant","model":"claude-3-haiku-20240307","stop_sequence":null,"usage":{"input_tokens":472,"output_tokens":2},"content":[],"stop_reason":null}}
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}
data: {"type": "ping"}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Okay"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":","}}
data: {"type":"cont
ent_block_delta","index":0,"del
ta":{"type":"text_delta","text":" let"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"'s"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" check"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" the"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" weather"}}data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" for"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" San"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" Francisco"}}
data: {"type":"content_block_delta","inde
x":0,"delta":{"type":"text_delta","text":","}}data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" CA"}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":":"}}
data: {"type":"content_block_stop","index":0}
data: {"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"toolu_01T1x1fJ34qAmk2tNTrN7Up6","name":"get_weather","input":{}}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":""}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_
json_delta","partial_json":"{\\"location\\":"}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":" \\"San"}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":" Francisc"}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"o,"}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","par
tial_json":" CA\\""}}data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":", "}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"\\"unit\\": \\"fah"}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partia
l_json":"renheit\\"}"}}
data: {"type":"content_block_stop","index":1}
data: {"type":"message_delta","delta":{"stop_reason":"tool_use","stop_se
quence":null},"usage":{"output_tokens":89}}data: {"type":"message_stop"}`;

const openAIResponse = `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{"role":"assistant","content":""},"logprobs":null,"finish_reason":null}]}
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini", "syst
em_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{"content":"Hello"},"logprobs":null,"finish_reason":null}]}
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"del
ta":{"content":" Worl"},"logprobs":null,"finish_reason":null}]}data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini", "system_fingerprint": "fp_44709d
6fcb", "choices":[{"index":0,"delta":{"content":"d!"},"logprobs":null,"finish_reason":null}]}
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini", "system_f
ingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}
data: [DONE]`;

const openAIResponseTools = `data: {"choices":[{"content_filter_results":{},"delta":{"content":null,"role":"assistant","tool_calls":[{"function":{"arguments":"","name":"search_notes"},"id":"call_iXWEt3RGcPnNz
T8Zn52HRTVj","index":0,"type":"function"}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.complet
ion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: {"choices":[{"content_filter_results":{},"delta":{"content":null,"role":"assistant","tool_calls":[{"function":{"arguments":"","name":"sea
rch_notes"},"id":"call_iXWEt3RGcPnNzT8Zn52HRTVj","index":0,"type":"function"}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_8
4ac7e2412"}data: {"choices":[{"content_filter_results":{},"delta":{"tool_calls":[{"function":{"arguments":"{\\""},"index":0}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: {"choices":[{"content_filter_results":{},"delta":{"tool_calls":[{"function":{"arguments":"query"},"index":0}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: {"choices":[{"content_filter_results":{},"delta":{"tool_calls":[{"function":{"arguments":"\\":\\""},"index":0}]},"finish_rea
son":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: {"choices":[{"content_filter_results":{},"delta":{"tool_calls":[{"function":{"arguments":"Le"},"index":0}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jA
sXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: {"choices":[{"content_filter_results":{},"delta":{"tool_calls":[{"function":{"arguments":"vens"},"index":0}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: {"choices":[{"content_filter_results":{},"delta":{"tool_calls":[{"function":{"arguments":"ht
e"},"index":0}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}data: {"choices":[{"content_filter_results":{},"delta":{"tool_calls":[{"function":{"arguments":"in"},"index":0}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRC
pJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: {"choices":[{"content_filter_results":{},"delta":{"tool_calls":[{"function":{"arguments":"\\"}"},"index":0}]},"finish_reason":null,"index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: {"choices":[{"content_filter_results":{},"delta":{},"finish_reason":"tool_calls","index":0,"logprobs":null}],"created":1734063838,"id":"chatcmpl-AdrVWRCpJ0jAsXlclXQGwLVyyiPbp","model":"gpt-4o-2024-05-13","object":"chat.completion.chunk","system_fingerprint":"fp_84ac7e2412"}
data: [DONE]`;

class MockReader {
  private data: { value: Uint8Array; done: boolean }[] = [];
  private cursor: number = 0;
  constructor(mockData: string) {
    const encode = new TextEncoder();
    const lines = mockData.split('\n');
    for (let i = 0; i < lines.length; i++) {
      this.data.push({
        value: encode.encode(lines[i]),
        done: i === lines.length - 1,
      });
    }
  }
  public async read() {
    return this.data[this.cursor++];
  }
}

describe('intellichat/readers/OpenAIReader', () => {
  test('read ', async () => {
    const mockReader = new MockReader(
      openAIResponse
    ) as unknown as ReadableStreamDefaultReader<Uint8Array>;
    let toolName: null|string = null;
    const openAIReader = new OpenAIReader(mockReader);
    const result = await openAIReader.read({
      onProgress: (content: string) => {
        console.log(content);
      },
      onError: (err: any) => {
        console.error(err);
      },
      onToolCalls: (tool: string) => {
        toolName = tool;
      },
    });
    expect(result.content).toEqual('Hello World!');
    expect(toolName).toBeNull();
  });
  test('read with tool calls', async () => {
    const mockReader = new MockReader(
      openAIResponseTools
    ) as unknown as ReadableStreamDefaultReader<Uint8Array>;
    let toolName: null | string = null;
    const openAIReader = new OpenAIReader(mockReader);
    const result = await openAIReader.read({
      onProgress: (content: string) => {
        // console.log(content);
      },
      onError: (err: any) => {
        console.error(err);
      },
      onToolCalls: (tool: string) => {
        toolName = tool;
      },
    });
    expect(result.content).toEqual('');
    expect(toolName).toEqual('search_notes');
    expect(result.tool).toEqual({
      id: 'call_iXWEt3RGcPnNzT8Zn52HRTVj',
      name: 'search_notes',
      args: { query: 'Levenshtein' },
    });
  });
});


describe('intellichat/readers/AnthropicReader', () => {
  test('read ', async () => {
    const mockReader = new MockReader(
      anthropicResponse
    ) as unknown as ReadableStreamDefaultReader<Uint8Array>;
    let toolName = null;
    const anthropicReader = new AnthropicReader(mockReader);
    const result = await anthropicReader.read({
      onProgress: (content: string) => {
        console.log(content);
      },
      onError: (err: any) => {
        console.error(err);
      },
      onToolCalls: (toolName: string) => {
        toolName = toolName;
      },
    });
    expect(result.content).toEqual('Hello!');
    expect(toolName).toBeNull();
    expect(result.tool).toBeNull();
    expect(result.outputTokens).toEqual(16);
    expect(result.inputTokens).toEqual(25);
  });

  test('read with tool calls', async () => {
    const mockReader = new MockReader(
      anthropicResponseTools
    ) as unknown as ReadableStreamDefaultReader<Uint8Array>;
    let toolName: null|string = null;
    const anthropicReader = new AnthropicReader(mockReader);
    const result = await anthropicReader.read({
      onProgress: (content: string) => {
        //console.log(content);
      },
      onError: (err: any) => {
        console.error(err);
      },
      onToolCalls: (tool: string) => {
        toolName = tool;
      }
    });
    expect(result.content).toEqual('Okay, let\'s check the weather for San Francisco, CA:');
    expect(toolName).toEqual('get_weather');
    expect(result.tool).toEqual({
      id: 'toolu_01T1x1fJ34qAmk2tNTrN7Up6',
      name: 'get_weather',
      args: { location: 'San Francisco, CA', unit: 'fahrenheit' },
    });
    expect(result.outputTokens).toEqual(91);
    expect(result.inputTokens).toEqual(472);
  });
})
