import { memo, useState } from 'react';

import DraggablePanel from '@/components/DraggablePanel';
import {
  CHAT_TEXTAREA_HEIGHT,
  CHAT_TEXTAREA_MAX_HEIGHT,
} from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

import Footer from './Footer';
import Head from './Header';
import TextArea from './TextArea';

const ChatInput = memo(() => {
  const [expand, setExpand] = useState<boolean>(false);

  const [inputHeight, updatePreference] = useGlobalStore((s) => [
    s.preference.inputHeight,
    s.updatePreference,
  ]);

  return (
    <DraggablePanel
      expandable={false}
      fullscreen={expand}
      maxHeight={CHAT_TEXTAREA_MAX_HEIGHT}
      minHeight={CHAT_TEXTAREA_HEIGHT}
      onSizeChange={(_, size) => {
        if (!size) return;

        updatePreference({
          inputHeight: typeof size.height === 'string' ? Number.parseInt(size.height) : size.height,
        });
      }}
      placement="bottom"
      size={{ height: inputHeight, width: '100%' }}
      style={{ zIndex: 10 }}
    >
      <div className="relative flex h-full flex-col gap-2 px-0 pb-4 pt-3">
        <Head expand={expand} setExpand={setExpand} />
        <TextArea setExpand={setExpand} />
        <Footer setExpand={setExpand} />
      </div>
    </DraggablePanel>
  );
});

export default ChatInput;
