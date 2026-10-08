'use client';

import CodeBlock from '@/components/CodeBlock';
import { cn } from '@/utils/cn';
import { CSSProperties, memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export const markdownComponents: Components = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  code({ className, children, node, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const isBlock = !!match || String(children).includes('\n');
    if (!isBlock) {
      return (
        <code className={cn('rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]', className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <CodeBlock language={match?.[1]}>
        {children}
      </CodeBlock>
    );
  },
  // CodeBlock already renders <pre>; forward the text to avoid invalid nested DOM
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pre({ children, node, ...props }) {
    return <>{children}</>;
  },
};

export interface MarkdownProps {
  children?: string;
  className?: string;
  style?: CSSProperties;
}

const Markdown = memo<MarkdownProps>(({ children, className, style }) => (
  <div
    className={cn(
      'prose prose-sm max-w-none break-words',
      // Default prose spacing is too loose for chat; tighten one step
      'prose-p:my-1 prose-pre:my-0 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:mb-2',
      '[&_a]:break-all [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline',
      className,
    )}
    style={style}
  >
    <ReactMarkdown
      components={markdownComponents}
      rehypePlugins={[
        rehypeHighlight,
        [rehypeExternalLinks, { rel: ['noreferrer', 'noopener'], target: '_blank' }],
      ]}
      remarkPlugins={[remarkGfm]}
    >
      {children}
    </ReactMarkdown>
  </div>
));

Markdown.displayName = 'Markdown';

export default Markdown;
