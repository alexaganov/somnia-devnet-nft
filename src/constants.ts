import { SomniaTestAbi } from "./types/abi/SomniaTest";
import { TokenMetadata } from "./types/web3";
import { Address, Chain } from "viem";

export const NFT_IMAGE_BASE_URL =
  "https://api.dicebear.com/9.x/pixel-art/svg?seed=";

export const SOMNIA_NATIVE_TOKEN = {
  decimals: 18,
  name: "STT",
  symbol: "STT",
} as const satisfies TokenMetadata;

export const somniaDevnet: Chain = {
  id: 50311,
  name: "Somnia Devnet",
  nativeCurrency: SOMNIA_NATIVE_TOKEN,
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://somnia-devnet.socialscan.io",
    },
  },
  testnet: true,
};
export const NFT_CONTRACT = {
  abi: SomniaTestAbi,
  address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as Address,
} as const;
