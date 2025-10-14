import { CSSProperties, FC, useRef, useState } from 'react';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Carousel, Space } from 'antd';
import { CarouselProps, CarouselRef } from 'antd/es/carousel';
import { useTranslation } from 'react-i18next';

interface BaseCarouselProperties {
  slides: Array<JSX.Element>;
  containerStyle?: CSSProperties;
}

const BaseCarousel: FC<BaseCarouselProperties & CarouselProps> = ({
  slides,
  containerStyle,
  ...properties
}) => {
  const carouselReference = useRef<CarouselRef | null>(null);
  const timeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [autoPlay, setAutoPlay] = useState(true);

  const { i18n } = useTranslation();

  const direction = i18n.dir(i18n.resolvedLanguage);

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const onPreviousClick = () => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
    }

    setAutoPlay(false);

    timeoutReference.current = setTimeout(() => {
      setAutoPlay(true);
    }, 15_000);

    carouselReference.current?.prev();
  };

  const onNextClick = () => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
    }

    setAutoPlay(false);

    timeoutReference.current = setTimeout(() => {
      setAutoPlay(true);
    }, 15_000);

    carouselReference.current?.next();
  };

  return (
    <Space style={containerStyle}>
      <div style={{ width: 15 }}>
        {direction === 'rtl' ? (
          <RightOutlined className="arrow" onClick={onPreviousClick} />
        ) : (
          <LeftOutlined className="arrow" onClick={onPreviousClick} />
        )}
      </div>
      <Carousel
        {...properties}
        ref={carouselReference}
        dots={{ className: 'carousel-dots' }}
        swipeToSlide
        autoplay={autoPlay}
        autoplaySpeed={5000}
      >
        {slides.map((slide, index) => (
          <div key={index}>{slide}</div>
        ))}
      </Carousel>
      {direction === 'rtl' ? (
        <LeftOutlined className="arrow" onClick={onNextClick} />
      ) : (
        <RightOutlined className="arrow" onClick={onNextClick} />
      )}
    </Space>
  );
};

export default BaseCarousel;
