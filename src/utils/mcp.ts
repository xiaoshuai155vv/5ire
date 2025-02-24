/**
 * ['--db-path',<dbPath>] => dbPath
 */

import { flatten, isUndefined } from "lodash";
import { MCPArgParameter, MCPArgType, MCPEnvParameter, MCPEnvType, IMCPServerParameter } from "types/mcp";

export function getParameters(parmas: string[]): IMCPServerParameter[] {
  const result:IMCPServerParameter[] = []
  if (!parmas) {
    return result;
  }
  const pattern = /\{\{(?<name>[^@]+)@(?<type>[^:]+)(::(?<description>[^}]*)?)?\}\}/;
  parmas.forEach((param:string)=>{
    const match = param.match(pattern);
    if (match && match.groups) {
      result.push({
            name: match.groups.name,
            type: match.groups.type as MCPEnvType|MCPArgType,
            description: match.groups.description||'',
        }) ;
  }});
  return result;
}

export function fillArgs(
  args: string[],
  params: MCPArgParameter
): string[] {
  const pattern = /\{\{(?<name>[^@]+)@(?<type>[^:]+)(::(?<description>[^}]*)?)?\}\}/;
  let _args:(string|string[])[] = [...args];
  for (let index=0; index<args.length; index++) {
    const arg = args[index]
    const match = arg.match(pattern);
    if(match && match.groups){
      _args[index] = params[match.groups.name]
    }
  }
  return flatten(_args);
}

export function FillEnv(
  env: Record<string, string> | undefined,
  params: { [key: string]: string }
): Record<string, string> {
  if(!env) return{}
  const pattern = /\{\{(?<name>[^@]+)@(?<type>[^:]+)(::(?<description>[^}]*)?)?\}\}/;
  let _env = {...env};
  const envKeys = Object.keys(env)
  for(const envKey of envKeys){
    const envItem = env[envKey]
    const match = envItem.match(pattern);
    if(match && match.groups){
      _env[envKey] = params[match.groups.name]||''
    }
  }
  return  _env
}
