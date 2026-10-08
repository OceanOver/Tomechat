// Compose a URL path with an optional query string and hash.
// A dummy base normalizes relative paths ('./home' -> '/home') and
// protocol-relative hosts ('//a.com/x' -> 'https://a.com/x').
const DUMMY_BASE = 'https://tomechat.invalid';

export const pathString = (
  path: string,
  { hash = '', search = '' }: { hash?: string; search?: string } = {},
): string => {
  const url = new URL(path, DUMMY_BASE);

  if (hash) url.hash = hash;
  if (search) url.search = search;

  return url.toString().replace(DUMMY_BASE, '');
};
