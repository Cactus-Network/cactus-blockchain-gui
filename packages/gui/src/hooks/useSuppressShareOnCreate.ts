import { usePrefs } from '@cactus-network.net/api-react';

export default function useSuppressShareOnCreate() {
  return usePrefs<boolean>('suppressShareOnCreate', false);
}
