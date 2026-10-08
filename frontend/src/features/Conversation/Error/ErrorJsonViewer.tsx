import { memo } from 'react';

import CodeBlock from '@/components/CodeBlock';
import { ChatMessageError } from '@/types/message';

interface ErrorJSONViewerProps {
  error?: ChatMessageError;
  id: string;
}

const ErrorJsonViewer = memo<ErrorJSONViewerProps>(({ error, id }) => {
  const errorBody = error?.body || error;

  if (!errorBody) return null;

  return (
    <div className="flex w-full max-w-[600px] flex-col" id={id}>
      <CodeBlock code={JSON.stringify(errorBody, null, 2)} language={'json'} />
    </div>
  );
});

export default ErrorJsonViewer;
