import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EditableMessage from './EditableMessage';

describe('EditableMessage', () => {
  it('renders editing textarea without throwing (no style.minHeight key)', () => {
    // react-textarea-autosize v8 throws if the style prop contains a minHeight key (even undefined)
    expect(() =>
      render(<EditableMessage editing height={200} onChange={() => {}} value="hello" />),
    ).not.toThrow();
  });

  it('renders openModal textarea without throwing', () => {
    expect(() =>
      render(<EditableMessage onChange={() => {}} openModal={false} value="" />),
    ).not.toThrow();
  });

  it('confirm commits the draft value', () => {
    const onChange = vi.fn();
    render(<EditableMessage onChange={onChange} openModal value="original" />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'updated' } });
    fireEvent.click(screen.getByText('ok'));

    expect(onChange).toHaveBeenLastCalledWith('updated');
  });

  it('cancel reverts to the original value', () => {
    const onChange = vi.fn();
    render(<EditableMessage onChange={onChange} openModal value="original" />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'updated' } });
    fireEvent.click(screen.getByText('cancel'));

    expect(onChange).toHaveBeenLastCalledWith('original');
    expect(textarea).toHaveValue('original');
  });
});
