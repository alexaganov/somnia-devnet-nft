import { Address, erc20Abi } from "viem";
import { Config } from "wagmi";
import { readContract, simulateContract, writeContract } from "wagmi/actions";

export interface Erc20AllowanceDetails {
  availableAllowance: bigint;
  hasRequiredAllowance: boolean;
  remainingRequiredAllowance: bigint;
  requiredAllowance: bigint;
}

export const readErc20ContractAllowanceDetails = async (
  config: Config,
  {
    spender,
    token,
    account,
    requiredAmount,
  }: {
    spender: Address;
    token: Address;
    account: Address;
    requiredAmount: bigint;
  }
): Promise<Erc20AllowanceDetails> => {
  const availableAllowance = await readContract(config, {
    abi: erc20Abi,
    address: token,
    functionName: "allowance",
    args: [account, spender],
  });

  const hasRequiredAllowance = availableAllowance >= requiredAmount;
  const remainingRequiredAllowance = hasRequiredAllowance
    ? BigInt(0)
    : requiredAmount - availableAllowance;

  return {
    availableAllowance,
    requiredAllowance: requiredAmount,
    hasRequiredAllowance,
    remainingRequiredAllowance,
  };
};

export const safeIncreaseErc20Allowance = async (
  config: Config,
  {
    spender,
    token,
    allowance,
  }: {
    spender: Address;
    token: Address;
    allowance: bigint;
  }
) => {
  const increaseAllowanceSimulation = await simulateContract(config, {
    abi: erc20Abi,
    address: token,
    functionName: "approve",
    args: [spender, allowance],
  });

  const increaseAllowanceHash = await writeContract(
    config,
    increaseAllowanceSimulation.request
  );

  return increaseAllowanceHash;
};
