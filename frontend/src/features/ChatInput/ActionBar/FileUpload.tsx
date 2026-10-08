import { LucideImage } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import FileUpload from '@/components/FileUpload';
import { Spinner } from '@/components/ui/spinner';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const FileUploadAction = memo(() => {
  const { t } = useTranslation('chat');
  const [loading, setLoading] = useState(false);
  const upload = useFileStore((s) => s.uploadFile);

  const model = useSessionStore(agentSelectors.currentAgentModel);
  const [canUpload, enabledFiles] = useGlobalStore((s) => [
    modelProviderSelectors.modelEnabledUpload(model)(s),
    modelProviderSelectors.modelEnabledFiles(model)(s),
  ]);

  return (
    <FileUpload
      accept={enabledFiles ? undefined : 'image/*'}
      disabled={!canUpload}
      multiple={true}
      onFileSelect={async (files) => {
        setLoading(true);
        for (const file of files) {
          await upload(file);
        }
        setLoading(false);
      }}
    >
      {loading ? (
        <span className="flex h-8 w-8 items-center justify-center text-muted-foreground">
          <Spinner className="size-[18px]" />
        </span>
      ) : (
        <ActionIcon
          disable={!canUpload}
          icon={LucideImage}
          placement={'bottom'}
          title={t(canUpload ? 'upload.actionTooltip' : 'upload.disabled')}
        />
      )}
    </FileUpload>
  );
});

export default FileUploadAction;
