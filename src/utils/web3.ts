import { Hash, Chain } from "viem";

export const getExplorerUrl = ({
  hash,
  chain,
  type,
}: {
  hash: Hash;
  chain: Chain;
  type: "tx";
}) => {
  const baseUrl = chain.blockExplorers?.default.url;

  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}/${type}/${hash}`;
};
