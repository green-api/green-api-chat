import { FC, useEffect, useMemo, useState } from 'react';

import { Avatar, Image, Skeleton } from 'antd';
import { AvatarProps } from 'antd/es/avatar/avatar';

import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import { normalizeAvatarSrc } from 'utils';

interface AvatarImageProps {
  src: string;
  size?: AvatarProps['size'];
  fallbackSrc?: string;
}

const AvatarImage: FC<AvatarImageProps> = ({
  src,
  size,
  fallbackSrc = emptyAvatarButAvailable,
}) => {
  const normalizedSrc = useMemo(() => normalizeAvatarSrc(src), [src]);
  const normalizedFallbackSrc = useMemo(() => normalizeAvatarSrc(fallbackSrc), [fallbackSrc]);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [normalizedSrc]);

  const resolvedSrc = hasError ? normalizedFallbackSrc : normalizedSrc;

  return (
    <Avatar
      src={
        <>
          {!loaded && <Skeleton.Avatar active style={{ width: 30, height: 30 }} />}
          <Image
            src={resolvedSrc}
            preview={false}
            onLoad={() => {
              setLoaded(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s',
              objectFit: 'cover',
            }}
          />
        </>
      }
      size={size}
      alt="avatar"
      onError={() => {
        if (!hasError && normalizedFallbackSrc) {
          setHasError(true);
        }

        return false;
      }}
    />
  );
};

export default AvatarImage;
