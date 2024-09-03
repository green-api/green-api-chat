import { FC } from 'react';

import { Avatar } from 'antd';

interface AvatarImageProps {
  src: string;
}

const AvatarImage: FC<AvatarImageProps> = ({ src }) => {
  return <Avatar src={src} size="large" alt="avatar" />;
};

export default AvatarImage;
