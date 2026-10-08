import { act, render } from '@testing-library/react';
import React, { forwardRef, useImperativeHandle } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DraggablePanel from './DraggablePanel';

// Capture the onResize callback / panelRef passed to the main Panel so tests can trigger them manually
let capturedProps: { onResize?: (...args: any[]) => void } = {};

// Simulate react-resizable-panels' internal pixel size (isCollapsed is derived from it)
let mockPanelPixels = 280;

vi.mock('react-resizable-panels', () => {
  const Panel = forwardRef<any, any>((props, _ref) => {
    // Only the main Panel carries panelRef; the filler Panel does not
    if (props.panelRef) {
      capturedProps = props;
      useImperativeHandle(props.panelRef, () => ({
        collapse: vi.fn(),
        expand: vi.fn(),
        isCollapsed: () => mockPanelPixels === 0,
        getSize: () => ({ inPixels: mockPanelPixels, asPercentage: 0 }),
        resize: vi.fn(),
      }));
    }
    return <div data-testid="mock-panel" />;
  });
  const Group = ({ children }: any) => <div>{children}</div>;
  const Separator = (_props: any) => <div data-testid="mock-separator" />;
  return { Panel, Group, Separator };
});

describe('<DraggablePanel /> controlled expand', () => {
  beforeEach(() => {
    capturedProps = {};
    mockPanelPixels = 280;
  });

  it('renders a zero-width placeholder without the layout system when expand=false', () => {
    const { container } = render(
      <DraggablePanel expand={false} minWidth={280} placement="right">
        <div>content</div>
      </DraggablePanel>,
    );

    expect(container.querySelector('[data-testid="mock-panel"]')).toBeNull();
    expect(container.querySelector('[data-testid="mock-separator"]')).toBeNull();
  });

  it('renders the layout system normally when expand=true', () => {
    const { container } = render(
      <DraggablePanel expand minWidth={280} placement="right">
        <div>content</div>
      </DraggablePanel>,
    );

    expect(container.querySelector('[data-testid="mock-panel"]')).not.toBeNull();
  });

  it('notifies onExpandChange(false) when the user collapses by resizing to 0 while expanded', () => {
    const onExpandChange = vi.fn();

    render(
      <DraggablePanel expand minWidth={280} onExpandChange={onExpandChange} placement="right">
        <div>content</div>
      </DraggablePanel>,
    );

    act(() => {
      capturedProps.onResize?.({ inPixels: 0 }, null, { inPixels: 280 });
    });
    expect(onExpandChange).toHaveBeenCalledWith(false);
  });

  it('does not trigger onExpandChange on a normal resize while expanded', () => {
    const onExpandChange = vi.fn();

    render(
      <DraggablePanel expand minWidth={280} onExpandChange={onExpandChange} placement="right">
        <div>content</div>
      </DraggablePanel>,
    );

    act(() => {
      capturedProps.onResize?.({ inPixels: 320 }, null, { inPixels: 280 });
    });
    expect(onExpandChange).not.toHaveBeenCalled();
  });
});
