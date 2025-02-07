/**
 * ['--db-path',<dbPath>] => dbPath
 */

export interface IMCPServerParameter {
  name: string;
  type: string;
  description: string;
}

function replaceParamInBrackets(
  params: { [key: string]: any },
  template: string
) {
  // 使用正则表达式匹配 <key:...> 的模式
  return template.replace(/<([^:>]+):[^>]*>/g, (match, key) => {
    // 检查 params 中是否存在对应的 key
    if (params.hasOwnProperty(key)) {
      // 如果存在，则返回 params 中对应 key 的值
      return params[key];
    }
    // 如果不存在，则返回原始匹配项
    return match;
  });
}

export function getParameters(args: string[]): IMCPServerParameter[] {
  if (!args) {
    return [];
  }
  const paramRegex = /<([^>]+)>/g;
  const params: IMCPServerParameter[] = [];
  let match;
  while ((match = paramRegex.exec(args.join(' '))) !== null) {
    const [name, type, description] = match[1].split(':');
    params.push({
      name,
      type: type || 'string',
      description: description || '',
    });
  }
  return params;
}

export function setParameters(
  args: string[],
  params: { [key: string]: string }
): string[] {
  let _args = [...args];
  for (const key in params) {
    _args = _args.map((arg) =>
      replaceParamInBrackets({ [key]: params[key] }, arg)
    );
  }
  return _args;
}

export function setEnv(
  env: Record<string, string> | undefined,
  params: { [key: string]: string }
): Record<string, string> {
  if (!env) {
    return {};
  }
  const _env = { ...env };
  for (const key in params) {
    const regex = new RegExp('<' + key + '>', 'g');
    for (const envKey in _env) {
      _env[envKey] = replaceParamInBrackets(
        { [key]: params[key] },
        _env[envKey]
      );
    }
  }
  return _env;
}
