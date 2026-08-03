import API from '../constants/API';

import type AppService from './AppService';
import type CacheService from './CacheService';
import type CactusLogsService from './CactusLogsService';
import type LinkService from './LinkService';
import type PreferencesService from './PreferencesService';

declare global {
  interface Window {
    [API.APP]: AppService;
    [API.CACHE]: CacheService;
    [API.CACTUS_LOGS]: CactusLogsService;
    [API.LINK]: LinkService;
    [API.PREFERENCES]: PreferencesService;
  }
}

// this export is needed to make this file a module
export {};
