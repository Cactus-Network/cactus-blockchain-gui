import type { PoolInfo } from '@cactus-network/api';
import { toCamelCase } from '@cactus-network/api';

export default async function getPoolInfo(poolUrl: string): Promise<PoolInfo> {
  const data = await window.appAPI.fetchPoolInfo(poolUrl);
  return toCamelCase(data) as PoolInfo;
}
