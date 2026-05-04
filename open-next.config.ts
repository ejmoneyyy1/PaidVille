import type {OpenNextConfig} from '@opennextjs/cloudflare';

const config = {
  default: {
    override: {
      wrapper: 'cloudflare-node',
      converter: 'edge',
      incrementalCache: 'dummy',
      tagCache: 'dummy',
      queue: 'dummy',
    },
  },
  dangerous: {
    disableIncrementalCache: true,
    disableTagCache: true,
  },
  cloudflare: {
    dangerousDisableConfigValidation: true,
  },
} as OpenNextConfig;

export default config;
