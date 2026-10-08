import { CSSProperties, memo, useCallback } from 'react';

import FileUpload from '@/components/FileUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { imageUrl } from '@/const/url';
import { useGlobalStore } from '@/store/global';
import { commonSelectors } from '@/store/global/selectors';
import { imageToBase64 } from '@/utils/imageToBase64';
import { createUploadImageHandler } from '@/utils/uploadFile';

interface AvatarWithUploadProps {
  compressSize?: number;
  id?: string;
  size?: number;
  style?: CSSProperties;
}

const AvatarWithUpload = memo<AvatarWithUploadProps>(
  ({ size = 40, compressSize = 256, style, id }) => {
    const [avatar, updateAvatar] = useGlobalStore((s) => [
      commonSelectors.userAvatar(s),
      s.updateAvatar,
    ]);

    const handleUploadAvatar = createUploadImageHandler((avatar) => {
      const img = new Image();
      img.src = avatar;
      img.addEventListener('load', () => {
        const webpBase64 = imageToBase64({ img, size: compressSize });
        updateAvatar(webpBase64);
      });
    });

    const handleFileSelect = useCallback(
      (files: File[]) => {
        const file = files[0];
        if (!file) return;
        handleUploadAvatar(file);
      },
      [handleUploadAvatar],
    );

    return (
      <div id={id} style={{ maxHeight: size, maxWidth: size, ...style }}>
        <FileUpload
          accept="image/*"
          className="overflow-hidden rounded-full transition-shadow hover:shadow-[0_0_0_3px_var(--foreground)] active:scale-90"
          onFileSelect={handleFileSelect}
        >
          <Avatar className="size-full cursor-pointer" style={{ height: size, width: size }}>
            {avatar ? (
              <AvatarImage alt="userAvatar" src={avatar} />
            ) : (
              <AvatarImage alt="Tomechat" src={imageUrl('logo.png')} />
            )}
            <AvatarFallback>CC</AvatarFallback>
          </Avatar>
        </FileUpload>
      </div>
    );
  },
);

export default AvatarWithUpload;
