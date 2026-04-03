import { FC, useEffect, useMemo, useState } from 'react';

import { Avatar } from 'antd';
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [normalizedSrc]);

  const resolvedSrc = hasError ? normalizedFallbackSrc : normalizedSrc;

  return (
    <Avatar
      src={resolvedSrc}
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
