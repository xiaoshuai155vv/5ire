import { describe, expect, test } from '@jest/globals';
import * as mcp from '../../src/utils/mcp';

describe('mcp', () => {
  test('getParameters', () => {
    const args1 = ['--db-path', '<dbPath>'];
    const params1 = mcp.getParameters(args1);
    expect(params1).toEqual(['dbPath']);

    const args2 = ['--db-path', '<dbPath>', '--db-name', '<dbName>'];
    const params2 = mcp.getParameters(args2);
    expect(params2).toEqual(['dbPath', 'dbName']);

    const args3 = [''];
    const params3 = mcp.getParameters(args3);
    expect(params3).toEqual([]);
  });

  test('setParameters', () => {
    const params = { dbPath: 'path/to/db', dbName: '5ire' };
    const args1 = ['--db-path', '<dbPath>'];
    const newArgs1 = mcp.setParameters(args1, params);
    expect(newArgs1).toEqual(['--db-path', 'path/to/db']);

    const args2 = ['--db-path', '<dbPath>', '--db-name', '<dbName>'];
    const newArgs2 = mcp.setParameters(args2, params);
    expect(newArgs2).toEqual(['--db-path', 'path/to/db', '--db-name', '5ire']);

    const args3 = [''];
    const newArgs3 = mcp.setParameters(args3, params);
    expect(newArgs3).toEqual(['']);
  });
});
