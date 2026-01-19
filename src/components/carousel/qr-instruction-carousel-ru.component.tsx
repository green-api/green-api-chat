import { FC } from 'react';

import { Image } from 'antd';

import BaseCarousel from './base-carousel';
import qrImage1 from 'assets/qr-info/ru/by-qr/by_qr_1_ru.svg';
import qrImage2 from 'assets/qr-info/ru/by-qr/by_qr_2_ru.svg';
import qrImage3 from 'assets/qr-info/ru/by-qr/by_qr_3_ru.svg';
import maxQrImage1 from 'assets/qr-info/ru/by-qr/max-1.png';
import maxQrImage2 from 'assets/qr-info/ru/by-qr/max-2.png';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';

const QrInstructionCarouselRu: FC = () => {
  const isMax = useIsMaxInstance();
  const slides = [
    <Image key={1} src={qrImage1} alt="QR instruction image" />,
    <Image key={2} src={qrImage2} alt="QR instruction image" />,
    <Image key={3} src={qrImage3} alt="QR instruction image" />,
  ];

  const maxSlides = [
    <Image key={1} src={maxQrImage1} alt="QR instruction image" />,
    <Image key={2} src={maxQrImage2} alt="QR instruction image" />,
  ];

  return (
    <BaseCarousel
      containerStyle={{ height: 450 }}
      slides={isMax ? maxSlides : slides}
      style={{ width: 250 }}
    />
  );
};

export default QrInstructionCarouselRu;
