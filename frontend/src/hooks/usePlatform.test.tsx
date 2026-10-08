import { act, render } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { useIsMacOS } from './usePlatform';

const MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const mockUserAgent = (ua: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
};

describe('useIsMacOS', () => {
  it('reflects the client platform after hydration without hydration mismatch errors', () => {
    mockUserAgent(MAC_UA);

    const Component = () => <div>{useIsMacOS() ? 'mac' : 'other'}</div>;

    // Server render must use the server snapshot (false), regardless of UA
    const serverHtml = renderToString(<Component />);
    expect(serverHtml).toContain('other');

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Hydrate the exact server markup on a client whose UA says macOS
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    document.body.append(container);

    act(() => {
      hydrateRoot(container, <Component />);
    });

    // After hydration, the client snapshot is applied (no reload needed)
    expect(container.textContent).toContain('mac');
    // React must not report hydration mismatches
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    container.remove();
  });

  it('returns the live platform value on a plain client render', () => {
    mockUserAgent(MAC_UA);
    const Component = () => <div>{useIsMacOS() ? 'mac' : 'other'}</div>;
    const { container } = render(<Component />);
    expect(container.textContent).toContain('mac');
  });
});
