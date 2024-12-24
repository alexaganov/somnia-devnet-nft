"use client";
import { NFT_CONTRACT, somniaDevnet, TOAST_MESSAGES } from "@/constants";
import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";

import { getContractErrorMessage } from "@/utils/error";
import { getNftContractTransferredNftsIdsFromLogs } from "@/utils/nft";

import { useMutation } from "@tanstack/react-query";
import React from "react";
import { Address, Chain, Hash } from "viem";
import { useAccount, useConfig } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import { PaymentToken } from "@/types/web3";
import usePaymentTokenBalance from "@/hooks/usePaymentTokenBalance";

import { createToast, toast } from "@/providers/ToastProvider";
import {
  safeNftContractMintNative,
  safeNftContractMintWithErc20,
  transformTokensIdsToNfts,
} from "@/utils/nft";
import { TransactionToastDescription } from "@/components/common/ToastTransactionDescription";
import { useEnsureChainWithFeedback } from "./useEnsureChainWithFeedback";
import { useEnsureErc20AllowanceWithFeedback } from "./useEnsureErc20AllowanceWithFeedback";
import { useEnsureNftPaymentTokenBalanceWithFeedback } from "./useEnsureNftPaymentTokenBalanceWithFeedback";

interface MintNftParams {
  amount: number;
  token: PaymentToken;
}

const useMintNftWithFeedback = (token: PaymentToken | undefined) => {
  const config = useConfig();
  const { address } = useAccount();
  const { refetch: refetchNftContractAccountData } =
    useReadNftContractAccountData(address);

  const {
    native: { refetch: refetchNativeTokenBalance },
    erc20: { refetch: refetchErc20TokenBalance },
  } = usePaymentTokenBalance(address as Address, token);

  return useMutation({
    mutationFn: async ({
      totalPrice,
      amount,
      chain,
      token,
    }: {
      chain: Chain;
      totalPrice: bigint;
      amount: number;
      token: PaymentToken;
    }) => {
      if (!address) {
        throw new Error("Wallet is not connected");
      }

      const mintToast = createToast(
        `Minting ${amount} NFT${amount === 1 ? "" : "s"}`
      );

      mintToast.loading({
        description: "Please approve transaction in your wallet.",
      });

      let txHash: Hash | null = null;

      try {
        const mintNativePromise =
          token.type === "native"
            ? safeNftContractMintNative(config, {
                amount,
                totalPrice,
              })
            : safeNftContractMintWithErc20(config, {
                amount,
              });

        txHash = await mintNativePromise;

        mintToast.loading({
          description: (
            <TransactionToastDescription
              chain={chain}
              description={TOAST_MESSAGES.TX_PENDING}
              txHash={txHash}
            />
          ),
        });

        // will also update gas price in case of erc20
        refetchNativeTokenBalance();

        if (token.type === "erc20") {
          refetchErc20TokenBalance();
        }

        const txReceipt = await waitForTransactionReceipt(config, {
          hash: txHash,
        });

        refetchNftContractAccountData();

        const data = getNftContractTransferredNftsIdsFromLogs(txReceipt.logs);

        mintToast.success({
          description: (
            <TransactionToastDescription
              chain={chain}
              description={TOAST_MESSAGES.TX_CONFIRMED}
              txHash={txHash}
            />
          ),
        });

        return transformTokensIdsToNfts(data);
      } catch (error) {
        const errorMessage = getContractErrorMessage(error);

        mintToast.error({
          description: txHash ? (
            <TransactionToastDescription
              chain={chain}
              description={`Error: ${errorMessage}`}
              txHash={txHash}
            />
          ) : (
            errorMessage
          ),
        });

        throw error;
      }
    },
  });
};

export const useMintNft = ({ token, amount }: MintNftParams) => {
  const { address } = useAccount();

  const { mutateAsync: ensuresChainWithFeedback } =
    useEnsureChainWithFeedback();
  const { mutateAsync: ensureAllowanceWithFeedback } =
    useEnsureErc20AllowanceWithFeedback();

  const { data: nftContractEssentialData } = useReadNftContractEssentialData();

  const { data: nftContractAccountData } =
    useReadNftContractAccountData(address);

  const {
    activeToken: { data: tokenBalance },
  } = usePaymentTokenBalance(address as Address, token);

  const { mutateAsync: mintNftWithFeedback } = useMintNftWithFeedback(token);

  const { mutateAsync: ensureNftPaymentTokenBalanceWithFeedback } =
    useEnsureNftPaymentTokenBalanceWithFeedback(address, token);

  const totalMintPrice =
    BigInt(amount) * (nftContractEssentialData?.mintPricePerNft ?? BigInt(0));

  const hasEnoughFunds = tokenBalance
    ? tokenBalance.value > totalMintPrice
    : true;

  const isAllMinted = !!nftContractAccountData?.isAllMinted;

  const { variables, mutateAsync, isPending, data } = useMutation({
    mutationFn: async () => {
      if (!address) {
        const reason = "Wallet is not connected";

        toast.error(reason);

        throw new Error(reason);
      }

      const chain = somniaDevnet;

      await ensuresChainWithFeedback(chain);

      await ensureNftPaymentTokenBalanceWithFeedback({
        amount: totalMintPrice,
      });

      if (token.type === "erc20") {
        await ensureAllowanceWithFeedback({
          chain,
          amount: totalMintPrice,
          spender: NFT_CONTRACT.address,
          token,
        });
      }

      const data = mintNftWithFeedback({
        chain,
        totalPrice: totalMintPrice,
        token,
        amount,
      });

      return data;
    },
  });

  return {
    hasEnoughFunds,
    isAllMinted,
    mint: mutateAsync,
    isMinting: isPending,
    mintedNftsIds: data,
    lastMintNftParams: variables,
  };
};
