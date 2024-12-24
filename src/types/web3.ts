import { Address } from "viem";
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
export interface PaymentTokenBase {
  id: string;
  meta: TokenMetadata;
  type: string;
  contract?: Address | undefined;
}
export interface PaymentTokenNative extends PaymentTokenBase {
  type: "native";
  contract?: undefined;
}
export interface PaymentTokenErc20 extends PaymentTokenBase {
  type: "erc20";
  contract: Address;
}

export type PaymentToken = PaymentTokenNative | PaymentTokenErc20;
