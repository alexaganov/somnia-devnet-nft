import { Erc20TestAbi } from "./abi/Erc20Test";

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

export interface Erc20TokenMetadata extends TokenMetadata {
  contract: {
    abi: typeof Erc20TestAbi;
    address: string;
  };
}
