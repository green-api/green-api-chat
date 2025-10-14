import { FC, MouseEvent, useState } from 'react';

import { YoutubeFilled } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import VideoTutorialModal from './modals/video-tutorial-modal.component';

interface TutorialLinkProperties {
  link: string;
  text?: string;
  additionalClassName?: string;
}

const TutorialLink: FC<TutorialLinkProperties> = ({ link, text, additionalClassName }) => {
  const { t } = useTranslation();
  const [isVisibleTutorialModal, setIsVisibleTutorialModal] = useState(false);

  const onClick = (event: MouseEvent) => {
    setIsVisibleTutorialModal(true);
    event.preventDefault();
  };

  return (
    <>
      <a
        onClick={onClick}
        className={additionalClassName ? `tutorial-link ${additionalClassName}` : 'tutorial-link'}
      >
        <Flex justify="center" align="center" gap={8}>
          <YoutubeFilled className="tutorial-link__icon" />
          <Typography.Link className="link-hover-underline">
            {text ?? t('VIDEO_TUTORIAL')}
          </Typography.Link>
        </Flex>
      </a>
      <VideoTutorialModal
        link={link}
        isVisible={isVisibleTutorialModal}
        setIsVisible={setIsVisibleTutorialModal}
      />
    </>
  );
};

export default TutorialLink;
