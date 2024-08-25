import type { Feature } from './types';

const title = 'Sentry error monitoring';

const config: Feature<{
  dsn: string;
  instance: string;
  release: string | undefined;
  environment: string;
  enableTracing: boolean;
}> = (() => {

  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;
