import { useEffect, useRef, useState } from 'react';

import { Progress } from 'antd';

import { ProgressBarPropertiesInterface } from 'types';

const Progressbar = ({ time, onFinish, ...properties }: ProgressBarPropertiesInterface) => {
  const { current: timeCreated } = useRef(new Date());

  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (percent > 99) {
      if (onFinish) onFinish();

      return;
    }

    setTimeout(
      () => {
        if (window.document.hidden) {
          document.addEventListener(
            'visibilitychange',
            () => {
              setPercent(Math.floor((Date.now() - timeCreated.getTime()) / 1000 / (time / 60)));
            },
            { once: true }
          );

          return;
        }

        setPercent((previousState) => previousState + 1);
      },
      (time / 60) * 1000
    );
  }, [percent]);

  if (percent > 99) return;

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <Progress {...properties} type="line" percent={percent} />
    </div>
  );
};

export default Progressbar;
