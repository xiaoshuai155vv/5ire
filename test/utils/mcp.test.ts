import {IMCPArgParameter, IMCPEnvParameter} from '../../src/types/mcp'
import { describe, expect, test } from '@jest/globals';
import * as mcp from '../../src/utils/mcp';

describe('mcp', () => {
  test('getParameters', () => {
    const args1 = ['--db-path', '{{dbPath@string::Sqlite database path}}'];
    const params1 = mcp.getParameters(args1);
    expect(params1.length).toEqual(1);
    expect(params1[0].name).toEqual('dbPath');
    expect(params1[0].type).toEqual('string');
    expect(params1[0].description).toEqual('Sqlite database path');

    const args2 = ['--db-path', '{{dbPath@string::database path}}', '--db-name', '{{dbName@string::database name}}'];
    const params2 = mcp.getParameters(args2);
    expect(params2.length).toEqual(2);
    expect(params2[0].name).toEqual('dbPath');
    expect(params2[0].type).toEqual('string');
    expect(params2[0].description).toEqual('database path');
    expect(params2[1].name).toEqual('dbName');
    expect(params2[1].type).toEqual('string');
    expect(params2[1].description).toEqual('database name')

    const args3 = ['--dirs', '{{dirs@list}}'];
    const params3 = mcp.getParameters(args3);
    expect(params3.length).toEqual(1);
    expect(params3[0].name).toEqual('dirs');
    expect(params3[0].type).toEqual('list');
    expect(params3[0].description).toEqual('');

    const args4 = ['--dirs', '{{dirs@list::}}'];
    const params4 = mcp.getParameters(args4);
    expect(params4.length).toEqual(1);
    expect(params4[0].name).toEqual('dirs');
    expect(params4[0].type).toEqual('list');
    expect(params4[0].description).toEqual('');

    const args5 = [''];
    const params5 = mcp.getParameters(args5);
    expect(params5).toEqual([]);

  });

  test('fillArgs', () => {
    const params = { "dbPath": 'path/to/db', "dbName": '5ire' } as unknown as IMCPArgParameter;
    const args1 = ['--db-path', '{{dbPath@string::database path}}'];
    const newArgs1 = mcp.fillArgs(args1, params);
    expect(newArgs1).toEqual(['--db-path', 'path/to/db']);

    const args2 = ['--db-path', '{{dbPath@string::}}', '--db-name', '{{dbName@string}}'];
    const newArgs2 = mcp.fillArgs(args2, params);
    expect(newArgs2).toEqual(['--db-path', 'path/to/db', '--db-name', '5ire']);

    const params3 = {
      dirs: ['path/1','path/2','path/3'],
      mod: 'write'
    } as unknown as IMCPArgParameter;
    const args3 = ['--dirs', '{{dirs@list::}}', '--mod', '{{mod@string}}'];
    const newArgs3 = mcp.fillArgs(args3, params3);
    expect(newArgs3).toEqual(['--dirs', 'path/1', 'path/2', 'path/3', '--mod', 'write']);

    const args4= [''];
    const newArgs4 = mcp.fillArgs(args4, params);
    expect(newArgs4).toEqual(['']);
  });

  test('fillEnv', () => {
    const params = { "apiKey": '01JMP46SH5M1HD91139N4TCA80', "apiBase": 'https://exapmple.com' } as unknown as IMCPEnvParameter;
    const env1 = {
      APIKEY: '{{apiKey@string::API Key}}',
      NAME: 'text',
      APIBASE: '{{apiBase@string}}',
    }
    const newEnv1= mcp.FillEnv(env1, params);
    expect(newEnv1).toEqual({
      APIKEY:'01JMP46SH5M1HD91139N4TCA80',
      NAME: 'text',
      APIBASE: 'https://exapmple.com'
    });

    const args4={};
    const newEnv4 = mcp.FillEnv(args4, params);
    expect(newEnv4).toEqual({});
  });
});
