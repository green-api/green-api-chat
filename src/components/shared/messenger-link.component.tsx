import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import githubIcon from 'assets/github.svg';
import linkedInIcon from 'assets/linkedIn.svg';
import rutubeIcon from 'assets/rutube.svg';
import telegramIcon from 'assets/telegram.svg';
import whatsappIcon from 'assets/whatsapp.svg';
import youtubeIcon from 'assets/youtube.svg';
import { EXTERNAL_LINKS } from 'configs';

const MessengerLink = () => {
  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  return (
    <Space direction="vertical" align="center" size="small">
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
      <Space>
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
          <img height={20} src={youtubeIcon} alt="youtube" />
        </a>
        {resolvedLanguage === 'ru' && (
          <a
            href={EXTERNAL_LINKS.rutube}
            target="_blank"
            className="messengerIcon"
            rel="noreferrer"
          >
            <img height={20} alt="rutube" src={rutubeIcon} />
          </a>
        )}
        <a
          href={EXTERNAL_LINKS.linkedIn}
          target="_blank"
          className="messengerIcon"
          rel="noreferrer"
        >
          <img height={20} alt="rutube" src={linkedInIcon} />
        </a>
      </Space>
    </Space>
  );
};

export default MessengerLink;
