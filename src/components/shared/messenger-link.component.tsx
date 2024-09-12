import { YoutubeFilled } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import githubIcon from 'assets/github.svg';
import telegramIcon from 'assets/telegram.svg';
import whatsappIcon from 'assets/whatsapp.svg';
import { EXTERNAL_LINKS } from 'configs';

const MessengerLink = () => {
  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  return (
    <Space align="center" size="small">
      <span className="link link-scale">
        <Typography.Link
          style={{ color: 'inherit', fontSize: 12 }}
          href={
            EXTERNAL_LINKS[
              `website_${resolvedLanguage}` as keyof Pick<typeof EXTERNAL_LINKS, 'website_en'>
            ] || EXTERNAL_LINKS.website_en
          }
          target="_blank"
        >
          GREEN-API ©{new Date().getFullYear()}
        </Typography.Link>
      </span>
      <span>
        <a
          href={
            EXTERNAL_LINKS.whatsappNewsChannel[
              resolvedLanguage as keyof typeof EXTERNAL_LINKS.whatsappNewsChannel
            ] ?? EXTERNAL_LINKS.whatsappNewsChannel.default
          }
          target="_blank"
          className="messengerIcon"
          rel="noreferrer"
        >
          <img height={20} src={whatsappIcon} alt="news" />
        </a>
      </span>
      {resolvedLanguage === 'he' ? (
        <a
          href={EXTERNAL_LINKS.whatsapp}
          target="_blank"
          className="messengerIcon"
          rel="noreferrer"
        >
          <img height={20} src={whatsappIcon} alt="whatsapp" />
        </a>
      ) : (
        <a
          href={
            EXTERNAL_LINKS.telegram[resolvedLanguage as keyof typeof EXTERNAL_LINKS.telegram] ||
            EXTERNAL_LINKS.telegram.default
          }
          target="_blank"
          className="messengerIcon"
          rel="noreferrer"
        >
          <img height={20} src={telegramIcon} alt="telegram" />
        </a>
      )}
      <a href={EXTERNAL_LINKS.github} target="_blank" className="messengerIcon" rel="noreferrer">
        <img height={20} src={githubIcon} alt="github" />
      </a>
      <a
        href={
          EXTERNAL_LINKS.youtube[resolvedLanguage as keyof typeof EXTERNAL_LINKS.youtube] ||
          EXTERNAL_LINKS.youtube.default
        }
        target="_blank"
        className="messengerIcon"
        rel="noreferrer"
      >
        <YoutubeFilled style={{ fontSize: 19 }} />
      </a>
    </Space>
  );
};

export default MessengerLink;
