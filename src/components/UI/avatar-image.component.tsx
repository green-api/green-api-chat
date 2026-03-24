import { FC } from 'react';

import { Avatar } from 'antd';
import { AvatarProps } from 'antd/es/avatar/avatar';
import { normalizeAvatarSrc } from 'utils';

interface AvatarImageProps {
  src: string;
  size?: AvatarProps['size'];
}

const AvatarImage: FC<AvatarImageProps> = ({ src, size }) => {
  return <Avatar src={normalizeAvatarSrc(src)} size={size} alt="avatar" />;
};

export default AvatarImage;
