/**
 * ['--db-path',<dbPath>] => dbPath
 */
export function getParameters(args: string[]): string[] {
  const paramRegex = /<([^>]+)>/g;
  const params: string[] = [];
  let match;
  while ((match = paramRegex.exec(args.join(' '))) !== null) {
    params.push(match[1]);
  }
  return params;
}

export function setParameters(
  args: string[],
  params: { [key: string]: string }
): string[] {
  let _args = [...args];
  for (const key in params) {
    const regex = new RegExp('<' + key + '>', 'g');
    _args = _args.map((arg) => arg.replace(regex, params[key]));
  }
  return _args;
}
