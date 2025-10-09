import { FC } from 'react';

import { Image } from 'antd';

import BaseCarousel from './base-carousel';
import qrImage1 from 'assets/qr-info/ru/by-number/by_number_1_ru.svg';
import qrImage2 from 'assets/qr-info/ru/by-number/by_number_2_ru.svg';
import qrImage3 from 'assets/qr-info/ru/by-number/by_number_3_ru.svg';
import qrImage4 from 'assets/qr-info/ru/by-number/by_number_4_ru.svg';

const NumberInstructionCarouselRu: FC = () => {
  const slides = [
    <Image key={1} src={qrImage1} alt="QR instruction image" />,
    <Image key={2} src={qrImage2} alt="QR instruction image" />,
    <Image key={3} src={qrImage3} alt="QR instruction image" />,
    <Image key={3} src={qrImage4} alt="QR instruction image" />,
  ];

  return <BaseCarousel containerStyle={{ height: 450 }} slides={slides} style={{ width: 250 }} />;
};

export default NumberInstructionCarouselRu;
