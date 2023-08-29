import { usePrefs } from '@cactus-network.net/api-react';

export default function useEnableAutoLogin() {
  return usePrefs<boolean>('enableAutoLogin', true);
}
