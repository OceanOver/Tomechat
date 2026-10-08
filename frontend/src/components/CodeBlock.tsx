'use client';

import { cn } from '@/utils/cn';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js/lib/common';
import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface CodeBlockProps {
  children?: ReactNode;
  className?: string;
  /**
   * Pass raw code text directly when used standalone (children as a plain string)
   */
  code?: string;
  language?: string;
  style?: React.CSSProperties;
}

const escapeHtml = (code: string) =>
  code.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** Extract plain text from any ReactNode (used by the copy button) */
const extractText = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in (node as any)) {
    return extractText((node as any).props?.children);
  }
  return '';
};

const CodeBlock = memo<CodeBlockProps>(({ children, className, code, language, style }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const rawCode = useMemo(() => code ?? extractText(children), [code, children]);

  const highlightedHtml = useMemo(() => {
    const text = code ?? (typeof children === 'string' ? children : '');
    if (!text) return null;
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(text, { language }).value;
      }
    } catch {
      // ignore highlight errors and fall through to escaped text
    }
    return escapeHtml(text);
  }, [code, children, language]);

  const handleCopy = useCallback(async () => {
    const { copyToClipboard } = await import('@/utils/clipboard');
    const success = await copyToClipboard(rawCode);
    if (!success) return;
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [rawCode]);

  return (
    <div className={cn('group/code my-2 overflow-hidden rounded-md border bg-muted/40', className)} style={style}>
      <div className="flex h-8 items-center justify-between border-b border-border/60 bg-muted/60 px-3">
        <span className="font-mono text-xs text-muted-foreground">{language || 'text'}</span>
        <button
          aria-label="copy code"
          className="flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={handleCopy}
          type="button"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-auto bg-transparent p-3 text-[13px] leading-relaxed">
        {highlightedHtml !== null ? (
          <code
            className={cn('hljs font-mono', className)}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <code className="hljs font-mono">{children}</code>
        )}
      </pre>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
