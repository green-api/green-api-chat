import { FC } from 'react';

import { Image } from 'antd';

import BaseCarousel from './base-carousel';
import qrImage1 from 'assets/qr-info/ru/by-qr/by_qr_1_ru.svg';
import qrImage2 from 'assets/qr-info/ru/by-qr/by_qr_2_ru.svg';
import qrImage3 from 'assets/qr-info/ru/by-qr/by_qr_3_ru.svg';
import maxQrImage1 from 'assets/qr-info/ru/by-qr/max-1.png';
import maxQrImage2 from 'assets/qr-info/ru/by-qr/max-2.png';
import tgImage1 from 'assets/qr-info/ru/by-qr/tg-1.png';
import tgImage2 from 'assets/qr-info/ru/by-qr/tg-2.png';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';

const QrInstructionCarouselRu: FC = () => {
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const slidesByType = {
    default: [
      <Image key={1} src={qrImage1} alt="QR instruction image" />,
      <Image key={2} src={qrImage2} alt="QR instruction image" />,
      <Image key={3} src={qrImage3} alt="QR instruction image" />,
    ],
    max: [
      <Image key={1} src={maxQrImage1} alt="QR instruction image" />,
      <Image key={2} src={maxQrImage2} alt="QR instruction image" />,
    ],
    telegram: [
      <Image key={1} src={tgImage1} alt="QR instruction image" />,
      <Image key={2} src={tgImage2} alt="QR instruction image" />,
    ],
  };

  let currentSlidesType: keyof typeof slidesByType = 'default';
  if (isTelegram) {
    currentSlidesType = 'telegram';
  } else if (isMax) {
    currentSlidesType = 'max';
  }

  return (
    <BaseCarousel
      containerStyle={{ height: 450 }}
      slides={slidesByType[currentSlidesType]}
      style={{ width: 250 }}
    />
  );
};

export default QrInstructionCarouselRu;
