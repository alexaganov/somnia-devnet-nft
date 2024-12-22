import { Address, Hash } from "viem";

export const shortenIdentifier = (
  identifier: Address | Hash,
  { start = 4, end = 4 }: { start?: number; end?: number } = {}
) => {
  const isIdentifier = /^0x[a-fA-F0-9]{40,}$/.test(identifier);

  if (!isIdentifier) {
    return identifier;
  }

  return `${identifier.slice(0, start + 2)}...${identifier.slice(-end)}`;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

type PromiseResult<T, E> = [null, T] | [E, null];

export const safeAsync = async <T, E = Error>(
  promise: Promise<T>
): Promise<PromiseResult<T, E>> => {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error as E, null];
  }
};
