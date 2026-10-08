import { startCase } from 'lodash-es';
import { CSSProperties, memo } from 'react';

import Avatar from '@/components/Avatar';
import Markdown from '@/components/Markdown';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MetaData } from '@/types/meta';

export interface AgentInfoProps {
  meta?: MetaData;
  onAvatarClick?: () => void;
  style?: CSSProperties;
  systemRole?: string;
}

const AgentInfo = memo<AgentInfoProps>(({ systemRole, style, meta, onAvatarClick }) => {
  if (!meta) return null;

  return (
    <div className="flex flex-col items-center gap-4" style={style}>
      {meta.avatar && (
        <Avatar
          animation
          avatar={meta.avatar}
          background={meta.backgroundColor || 'hsl(var(--muted))'}
          className="flex-none"
          onClick={onAvatarClick}
          size={100}
        />
      )}
      {meta.title && <div className="text-center text-xl font-semibold">{meta.title}</div>}
      {!!(meta?.tags as string[])?.length && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {(meta.tags as string[]).map((tag: string, index) => (
            <Badge key={index} variant="secondary">
              {startCase(tag).trim()}
            </Badge>
          ))}
        </div>
      )}
      {meta.description && (
        <div className="text-center text-sm text-muted-foreground">{meta.description}</div>
      )}
      {systemRole && (
        <>
          <Separator className="my-2" />
          <Markdown className="w-full">{systemRole}</Markdown>
        </>
      )}
    </div>
  );
});

export default AgentInfo;
