import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './cactusLazyBaseQuery';

export { baseQuery };

export default createApi({
  reducerPath: 'cactusApi',
  baseQuery,
  endpoints: () => ({}),
});
