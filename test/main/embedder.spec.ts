import { describe } from '@jest/globals';
import { embed } from '../../src/main/embedder';



beforeAll(() => {

  const originalImplementation = Array.isArray;
  // @ts-ignore
  Array.isArray = jest.fn((type) => {
    if (type && type.constructor && (type.constructor.name === "Float32Array" || type.constructor.name === "BigInt64Array")) {
      return true;
    }
    return originalImplementation(type);
  });
});

describe('Embedder', () => {
  it('embed', async () => {
    const progressCallback = (total:number,done:number) => {
      console.log(`Progress: ${done}/${total}`);
    };
    const texts = ['杨家有女初长成', '养在深闺人未识'];
    const result = await embed(texts, progressCallback);
    expect(result.length).toBe(2);
  });
});

