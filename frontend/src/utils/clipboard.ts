/**
 * Copy text to the clipboard; uses the Clipboard API first, falling back to execCommand
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall back to execCommand
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // avoid scroll jumps and visible flicker
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    textarea.remove();
    return success;
  } catch {
    return false;
  }
}
