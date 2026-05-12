import { useMemo } from 'react';
import type { ReactNode } from 'react';

import { Avatar } from 'antd';

import { getAvatarTitle } from './status-history.utils';
import AvatarImage from 'components/UI/avatar-image.component';
import { useAppSelector } from 'hooks';
import { useGetAvatarQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

interface StatusAvatarProps {
  chatId?: string;
  className?: string;
  previewNode?: ReactNode;
  segments?: number;
  size?: 'small' | 'default' | 'large' | number;
}

const DEFAULT_AVATAR_SIZES = {
  small: 24,
  default: 32,
  large: 40,
} as const;

const getSegmentedRingGradient = (segments: number) => {
  const clamped = Math.min(Math.max(segments, 1), 24);
  const gap = clamped > 1 ? 2 : 0;
  const part = 360 / clamped;
  const halfGap = gap / 2;

  const slices = Array.from({ length: clamped }, (_, index) => {
    const start = index * part + halfGap;
    const end = (index + 1) * part - halfGap;
    const next = (index + 1) * part + halfGap;

    return `var(--primary-color) ${start}deg ${end}deg, transparent ${end}deg ${next}deg`;
  });

  return `conic-gradient(${slices.join(', ')})`;
};

const StatusAvatar = ({
  chatId,
  className,
  previewNode,
  segments = 0,
  size = 'large',
}: StatusAvatarProps) => {
  const instanceCredentials = useAppSelector(selectInstance);

  const skipAvatarQuery =
    !instanceCredentials?.idInstance || !instanceCredentials?.apiTokenInstance || !chatId;

  const { data: avatarData } = useGetAvatarQuery(
    {
      ...instanceCredentials,
      chatId: chatId || '',
    },
    { skip: skipAvatarQuery }
  );

  const initials = getAvatarTitle(chatId).slice(-2) || '?';
  const avatarSize =
    typeof size === 'number' ? size : DEFAULT_AVATAR_SIZES[size] || DEFAULT_AVATAR_SIZES.default;
  const ringSize = avatarSize + 6;
  const ringBackground = useMemo(
    () => (segments > 0 ? getSegmentedRingGradient(segments) : ''),
    [segments]
  );

  const avatarNode = avatarData?.urlAvatar ? (
    <AvatarImage src={avatarData.urlAvatar} size={avatarSize} />
  ) : (
    <Avatar className={segments <= 0 ? className : undefined} size={avatarSize}>
      {initials}
    </Avatar>
  );

  const contentNode = previewNode || avatarNode;

  if (segments <= 0) {
    return contentNode;
  }

  return (
    <span
      className={`status-avatar-segments ${className || ''}`}
      style={{
        width: ringSize,
        height: ringSize,
        backgroundImage: ringBackground,
      }}
    >
      <span className="status-avatar-segments__inner">{contentNode}</span>
    </span>
  );
};

export default StatusAvatar;
