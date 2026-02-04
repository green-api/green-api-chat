import { FC } from 'react';

import { Image } from 'antd';

import BaseCarousel from './base-carousel';
import qrImage1 from 'assets/qr-info/en/by-qr/by_qr_1_en.png';
import qrImage2 from 'assets/qr-info/en/by-qr/by_qr_2_en.svg';
import qrImage3 from 'assets/qr-info/en/by-qr/by_qr_3_en.svg';
import tgImage1 from 'assets/qr-info/en/by-qr/tg-en-1.png';
import tgImage2 from 'assets/qr-info/en/by-qr/tg-en-2.png';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';

const QrInstructionCarouselEn: FC = () => {
  const isTelegram = useIsTelegramInstance();
  const slidesByType = {
    whatsapp: [
      <Image key={1} src={qrImage1} alt="QR instruction image" />,
      <Image key={2} src={qrImage2} alt="QR instruction image" />,
      <Image key={3} src={qrImage3} alt="QR instruction image" />,
    ],
    telegram: [
      <Image key={1} src={tgImage1} alt="QR instruction image" />,
      <Image key={2} src={tgImage2} alt="QR instruction image" />,
    ],
  };

  return (
    <BaseCarousel
      containerStyle={{ height: 450 }}
      slides={slidesByType[isTelegram ? 'telegram' : 'whatsapp']}
      style={{ width: 250 }}
    />
  );
};

export default QrInstructionCarouselEn;
