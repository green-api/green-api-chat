import { FC } from 'react';

import loaderLizard from 'assets/loader-lizard.gif';

type LizardLoaderProperties = {
  size?: 'small' | 'medium' | 'large';
};

const sizeMap = {
  small: 100,
  medium: 200,
  large: 300,
};

const LizardLoader: FC<LizardLoaderProperties> = ({ size = 'medium' }) => {
  const width = sizeMap[size];

  return (
    <img
      src={loaderLizard}
      alt="loader"
      style={{
        position: 'absolute',
        top: '50%',
        right: '50%',
        transform: 'translate(50%, -50%)',
        zIndex: 1000,
        width,
        height: 'auto',
      }}
    />
  );
};

export default LizardLoader;
