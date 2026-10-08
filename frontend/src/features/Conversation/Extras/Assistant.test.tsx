import { render, screen } from '@testing-library/react';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/message';

import { AssistantMessageExtra } from './Assistant';

// Mock Translate so rendering can be asserted without its internals
const TranslateMock = vi.fn((_: Record<string, unknown>) => <div>Translate Component</div>);

vi.mock('./Translate', () => ({
  default: (props: any) => TranslateMock(props),
}));

// The component reads loading state from the chat store
vi.mock('@/store/chat', () => ({
  useChatStore: vi.fn(),
}));

const mockData: ChatMessage = {
  content: 'test-content',
  createdAt: 0,
  id: 'abc',
  meta: { avatar: '', backgroundColor: '', description: '', tags: [], title: '' },
  role: 'assistant',
  updatedAt: 0,
};

describe('AssistantMessageExtra', () => {
  beforeEach(() => {
    TranslateMock.mockClear();
    (useChatStore as unknown as Mock).mockImplementation((selector: any) =>
      selector({ chatLoadingId: null }),
    );
  });

  it('should render nothing when extra is undefined', () => {
    render(<AssistantMessageExtra {...mockData} />);
    expect(screen.queryByText('Translate Component')).toBeNull();
  });

  it('should render nothing when extra has no translate entry', () => {
    render(<AssistantMessageExtra {...mockData} extra={{ fromModel: 'otherModel' }} />);
    expect(screen.queryByText('Translate Component')).toBeNull();
  });

  it('should render the Translate component when extra.translate exists', () => {
    render(<AssistantMessageExtra {...mockData} extra={{ translate: { to: 'abc' } }} />);
    expect(screen.getByText('Translate Component')).toBeInTheDocument();
  });

  it('should pass loading=true to Translate when the message is generating', () => {
    (useChatStore as unknown as Mock).mockImplementation((selector: any) =>
      selector({ chatLoadingId: 'abc' }),
    );

    render(<AssistantMessageExtra {...mockData} extra={{ translate: { to: 'abc' } }} />);

    expect(screen.getByText('Translate Component')).toBeInTheDocument();
    expect(TranslateMock).toHaveBeenCalledWith(expect.objectContaining({ loading: true }));
  });
});
