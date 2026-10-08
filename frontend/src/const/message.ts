export const LOADING_FLAT = '...';

export const testFunctionMessageAtEnd = (content: string) => {
  const regExp = /{"tool_calls":.*?]}$/;
  const match = content?.trim().match(regExp);

  return { content: match ? match[0] : '', valid: !!match };
};
