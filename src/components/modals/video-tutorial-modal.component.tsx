import { FC } from 'react';

import { Modal } from 'antd';

import { GlobalModalPropertiesInterface } from 'types';

type VideoTutorialModalProperties = Omit<GlobalModalPropertiesInterface, 'idInstance'> & {
  link: string;
};

const VideoTutorialModal: FC<VideoTutorialModalProperties> = ({
  isVisible,
  setIsVisible,
  link,
}) => {
  return (
    <Modal
      centered
      open={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      closable={false}
      destroyOnClose
      width={'100%'}
      className="tutorial-modal"
    >
      <iframe
        className="tutorial-iframe"
        width="640"
        height="360"
        src={link}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </Modal>
  );
};

export default VideoTutorialModal;
