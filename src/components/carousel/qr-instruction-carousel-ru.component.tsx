import { FC } from 'react';

import { Image } from 'antd';

import BaseCarousel from './base-carousel';
import qrImage1 from 'assets/qr-info/ru/by-qr/by_qr_1_ru.svg';
import qrImage2 from 'assets/qr-info/ru/by-qr/by_qr_2_ru.svg';
import qrImage3 from 'assets/qr-info/ru/by-qr/by_qr_3_ru.svg';

const QrInstructionCarouselRu: FC = () => {
  const slides = [
    <Image key={1} src={qrImage1} alt="QR instruction image" />,
    <Image key={2} src={qrImage2} alt="QR instruction image" />,
    <Image key={3} src={qrImage3} alt="QR instruction image" />,
  ];

  return <BaseCarousel containerStyle={{ height: 450 }} slides={slides} style={{ width: 250 }} />;
};

export default QrInstructionCarouselRu;
