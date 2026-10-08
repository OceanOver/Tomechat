import { describe, expect, it } from 'vitest';

import { parseJsonRes } from './knowledge';

describe('parseJsonRes', () => {
  it('parses a normal JSON body', async () => {
    const res = new Response(JSON.stringify({ code: 200, data: [] }));
    await expect(parseJsonRes(res)).resolves.toEqual({ code: 200, data: [] });
  });

  it('throws a readable error on empty body instead of SyntaxError', async () => {
    const res = new Response(null, { status: 500 });
    await expect(parseJsonRes(res)).rejects.toThrow('knowledge API 500');
  });

  it('throws a readable error on non-JSON body', async () => {
    const res = new Response('<html>Bad Gateway</html>', { status: 502 });
    await expect(parseJsonRes(res)).rejects.toThrow('knowledge API 502');
  });
});
