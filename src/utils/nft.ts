import { NFT_CONTRACT, NFT_IMAGE_BASE_URL } from "@/constants";
import { Address, Log, parseEventLogs } from "viem";
import { Config } from "wagmi";
import { simulateContract, writeContract } from "wagmi/actions";
import { NftData } from "@/types/nft";

export const safeNftContractMintNative = async (
  config: Config,
  {
    contract = NFT_CONTRACT.address,
    totalPrice,
    amount,
  }: {
    contract?: Address;
    amount: number;
    totalPrice: bigint;
  }
) => {
  const mintNftSimulation = await simulateContract(config, {
    abi: NFT_CONTRACT.abi,
    address: contract,
    functionName: "mintNative",
    args: [BigInt(amount)],
    value: totalPrice,
  });

  const mintNativeTransactionHash = await writeContract(
    config,
    mintNftSimulation.request
  );

  return mintNativeTransactionHash;
};

export const safeNftContractMintWithErc20 = async (
  config: Config,
  {
    contract = NFT_CONTRACT.address,
    amount,
  }: {
    contract?: Address;
    amount: number;
  }
) => {
  const mintNftSimulation = await simulateContract(config, {
    abi: NFT_CONTRACT.abi,
    address: contract,
    functionName: "mintWithERC20",
    args: [BigInt(amount)],
  });

  const mintNativeTransactionHash = await writeContract(
    config,
    mintNftSimulation.request
  );

  return mintNativeTransactionHash;
};

export const transformTokensIdsToNfts = (
  tokensIds: readonly bigint[]
): NftData[] => {
  return tokensIds.map((tokenId) => {
    return {
      id: tokenId.toString(),
      tokenId,
      imageUrl: getNftImageUrl(tokenId),
    };
  });
};

export const getNftImageUrl = (tokenId: string | number | bigint) => {
  return `${NFT_IMAGE_BASE_URL}${tokenId}`;
};

export const getNftContractTransferredNftsIdsFromLogs = (
  logs: Log<bigint, number, false>[]
) => {
  const parsedLogs = parseEventLogs({
    abi: NFT_CONTRACT.abi,
    logs,
  });

  return parsedLogs
    .filter((log) => log.eventName === "Transfer")
    .map((log) => log.args.tokenId);
};
