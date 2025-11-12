import { useState, useEffect } from 'react';
import { getPlatform } from '@meetily/shared-logic';

export function usePlatform() {
  const [platform, setPlatform] = useState<'desktop' | 'ios' | 'android'>('desktop');

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  return {
    platform,
    isDesktop: platform === 'desktop',
    isMobile: platform === 'ios' || platform === 'android',
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
  };
}
