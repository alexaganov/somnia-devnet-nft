import { TokenMetadata } from "@/types/web3";
import { Hash, Chain, AddEthereumChainParameter, formatUnits } from "viem";

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

export const formatToken = (amount: bigint, token: TokenMetadata) => {
  return `${formatUnits(amount, token.decimals)} ${token.symbol}`;
};

export const transformChainToAddEthereumChainParameter = (
  chain: Chain
): Omit<AddEthereumChainParameter, "chainId"> => {
  return {
    blockExplorerUrls: [chain.blockExplorers?.default.url as string],
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls.default.http,
  };
};
