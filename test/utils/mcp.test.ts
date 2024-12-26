import { describe, expect, test } from '@jest/globals';
import * as mcp from '../../src/utils/mcp';

describe('mcp', () => {
  test('getParameters', () => {
    const args1 = ['--db-path', '<dbPath:string:Sqlite database path>'];
    const params1 = mcp.getParameters(args1);
    expect(params1.length).toEqual(1);
    expect(params1[0].name).toEqual('dbPath');
    expect(params1[0].type).toEqual('string');
    expect(params1[0].description).toEqual('Sqlite database path');

    const args2 = ['--db-path', '<dbPath:string:database path>', '--db-name', '<dbName:string:database name>'];
    const params2 = mcp.getParameters(args2);
    expect(params2.length).toEqual(2);
    expect(params2[0].name).toEqual('dbPath');
    expect(params2[0].type).toEqual('string');
    expect(params2[0].description).toEqual('database path');
    expect(params2[1].name).toEqual('dbName');
    expect(params2[1].type).toEqual('string');
    expect(params2[1].description).toEqual('database name')

    const args3 = [''];
    const params3 = mcp.getParameters(args3);
    expect(params3).toEqual([]);
  });

  test('setParameters', () => {
    const params = { dbPath: 'path/to/db', dbName: '5ire' };
    const args1 = ['--db-path', '<dbPath:string:database path>'];
    const newArgs1 = mcp.setParameters(args1, params);
    expect(newArgs1).toEqual(['--db-path', 'path/to/db']);

    const args2 = ['--db-path', '<dbPath:string:database path>', '--db-name', '<dbName:string:database name>'];
    const newArgs2 = mcp.setParameters(args2, params);
    expect(newArgs2).toEqual(['--db-path', 'path/to/db', '--db-name', '5ire']);

    const args3 = [''];
    const newArgs3 = mcp.setParameters(args3, params);
    expect(newArgs3).toEqual(['']);
  });
});
