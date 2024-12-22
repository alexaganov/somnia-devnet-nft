"use client";
import { NFT_CONTRACT, somniaDevnet } from "@/constants";
import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";

import { safeAsync, shortenIdentifier } from "@/utils";
import { getExplorerUrl } from "@/utils/web3";
import { getContractErrorMessage } from "@/utils/error";
import { getNftContractTransferredNftsIdsFromLogs } from "@/utils/nft";

import { useMutation } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { Address, Hash, InsufficientFundsError } from "viem";
import { useAccount, useConfig } from "wagmi";
import { switchChain, waitForTransactionReceipt } from "wagmi/actions";

import { Button } from "@/components/ui/button";
import { NftPaymentToken } from "@/hooks/useNftContractPaymentTokens";
import useNftContractPaymentTokenBalance from "@/hooks/useNftContractPaymentTokenBalance";
import {
  readErc20ContractAllowanceDetails,
  safeIncreaseErc20Allowance,
} from "@/utils/erc20";
import { createToast } from "@/providers/ToastProvider";
import {
  safeNftContractMintNative,
  safeNftContractMintWithErc20,
  transformTokensIdsToNfts,
} from "@/utils/nft";
import { TransactionToastDescription } from "@/components/common/ToastTransactionDescription";

interface MintNftParams {
  amount: number;
  token: NftPaymentToken;
}

export const useMintNft = () => {
  const config = useConfig();
  const { address } = useAccount();

  const {
    data: nftContractEssentialData,
    refetch: refetchNftContractEssentialData,
  } = useReadNftContractEssentialData();

  const { variables, mutateAsync, isPending, data } = useMutation({
    mutationFn: async ({ amount, token }: MintNftParams) => {
      const requiredDataVerificationToast = createToast(
        "Verification of Required Information"
      );

      const chain = await switchChain(config, {
        chainId: somniaDevnet.id,
      });

      console.log({ chain });

      if (!address || !chain) {
        const reason = "Wallet is not connected";

        requiredDataVerificationToast.error({
          description: <>Error: {reason}</>,
        });

        throw new Error(reason);
      }

      requiredDataVerificationToast.loading({
        description:
          "We're currently verifying the required details to proceed with minting. Please hold on for a moment",
      });

      const { data: freshNftContractEssentialData } =
        await refetchNftContractEssentialData();

      if (!freshNftContractEssentialData) {
        const reason = "Unable to Access NFT Contract Data.";

        requiredDataVerificationToast.error({
          description: (
            <>
              Error: {reason}
              <br />
              We encountered an issue reading the necessary data from the NFT
              contract to proceed with minting. Please try again later. If the
              issue persists, contact support for assistance.
            </>
          ),
        });

        throw new Error(reason);
      }

      // if (!connector) {
      //   return;
      // }

      // const switchedChain = await connector.?.({
      //   chainId: somniaDevnet.id,
      //   addEthereumChainParameter: {
      //     iconUrls: ["https://assets.reown.com/reown-profile-pic.png"],
      //     blockExplorerUrls: [somniaDevnet.blockExplorers?.default.url],
      //     chainName: somniaDevnet.name,
      //     nativeCurrency: somniaDevnet.nativeCurrency,
      //     rpcUrls: somniaDevnet.rpcUrls.default.http,
      //   },
      // });
      // const switchedChain = await switchChainAsync({
      //   connector,
      // });

      // console.log({ switchedChain });

      // const switchedChain = await switchChainAsync({
      //   chainId: somniaDevnet.id,
      // });

      // console.log({ switchedChain });

      // try {
      //   await connectWallet();
      // } catch (error) {
      //   // TODO: show toast
      //   console.log({ error, message: "not connected" });

      //   return;
      // }

      const { data: freshTokenBalance } = await refetchTokenBalance();

      if (!freshTokenBalance) {
        const reason = "Unable to Retrieve Account Balance.";

        requiredDataVerificationToast.error({
          description: (
            <>
              Error: {reason}
              <br />
              We couldn't retrieve the latest account balance. Please try again
              later. If the issue persists, contact support for assistance.
            </>
          ),
        });

        throw new Error(reason);
      }

      const totalMintPrice =
        BigInt(amount) * freshNftContractEssentialData.mintPricePerNft;

      if (totalMintPrice > freshTokenBalance.value) {
        requiredDataVerificationToast.error({
          description: (
            <>
              Error: Insufficient Balance
              <br />
              You don't have enough funds in your account to proceed. Please
              check your balance or deposit additional funds before trying again
            </>
          ),
        });

        throw new InsufficientFundsError();
      }

      if (token.type === "native") {
        requiredDataVerificationToast.success({
          description: "All required details have been successfully verified.",
        });
      } else if (token.type === "erc20") {
        const [allowanceDetailsError, allowanceDetails] = await safeAsync(
          readErc20ContractAllowanceDetails(config, {
            token: token.contract,
            account: address,
            requiredAmount: totalMintPrice,
            spender: NFT_CONTRACT.address,
          })
        );

        if (allowanceDetailsError) {
          requiredDataVerificationToast.error({
            description:
              "Error: We couldn't verify user allowance information. Please try again later.",
          });

          throw allowanceDetailsError;
        }

        requiredDataVerificationToast.success({
          description: "All required details have been successfully verified.",
        });

        if (!allowanceDetails.hasRequiredAllowance) {
          const allowanceToast = createToast("Allowance Increase");

          allowanceToast.loading({
            description:
              "Waiting for you to approve the allowance increase in your wallet. This is required to proceed with the minting process.",
          });

          const [increaseAllowanceError, allowanceTxHash] = await safeAsync(
            safeIncreaseErc20Allowance(config, {
              spender: NFT_CONTRACT.address,
              token: token.contract,
              // NOTE: we should pass the whole amount
              allowance: allowanceDetails.requiredAllowance,
            })
          );

          if (increaseAllowanceError) {
            allowanceToast.error({
              description: (
                <>Error: {getContractErrorMessage(increaseAllowanceError)}</>
              ),
            });

            throw increaseAllowanceError;
          }

          allowanceToast.loading({
            description: (
              <TransactionToastDescription
                chain={chain}
                description="Transaction submitted! Waiting for confirmation."
                txHash={allowanceTxHash}
              />
            ),
          });

          const [transactionError] = await safeAsync(
            waitForTransactionReceipt(config, {
              hash: allowanceTxHash,
            })
          );

          if (transactionError) {
            allowanceToast.error({
              description: (
                <TransactionToastDescription
                  chain={chain}
                  description={getContractErrorMessage(transactionError)}
                  txHash={allowanceTxHash}
                />
              ),
            });

            throw transactionError;
          }

          allowanceToast.success({
            description: (
              <TransactionToastDescription
                chain={chain}
                description="Transaction Confirmed!"
                txHash={allowanceTxHash}
              />
            ),
          });
        }
      }

      const mintToast = createToast("Minting");

      mintToast.loading({
        description: "Waiting for user to approve the minting.",
      });

      const mintNativePromise =
        token.type === "native"
          ? safeNftContractMintNative(config, {
              amount,
              totalPrice: totalMintPrice,
            })
          : safeNftContractMintWithErc20(config, {
              amount,
            });

      const [mintTxError, mintTxHash] = await safeAsync(mintNativePromise);

      if (mintTxError) {
        mintToast.error({
          description: getContractErrorMessage(mintTxError),
        });

        throw mintTxError;
      }

      mintToast.loading({
        description: (
          <TransactionToastDescription
            chain={chain}
            description="Transaction submitted! Waiting for confirmation."
            txHash={mintTxHash}
          />
        ),
      });

      const [mintTxReceiptError, mintTxReceipt] = await safeAsync(
        waitForTransactionReceipt(config, {
          hash: mintTxHash,
        })
      );

      if (mintTxReceiptError) {
        mintToast.error({
          description: (
            <TransactionToastDescription
              chain={chain}
              description={getContractErrorMessage(mintTxReceiptError)}
              txHash={mintTxHash}
            />
          ),
        });

        throw mintTxReceiptError;
      }

      const data = getNftContractTransferredNftsIdsFromLogs(mintTxReceipt.logs);

      mintToast.success({
        description: (
          <TransactionToastDescription
            chain={chain}
            description="Transaction Confirmed!"
            txHash={mintTxHash}
          />
        ),
      });

      return transformTokensIdsToNfts(data);
    },
  });

  const { data: nftContractAccountData } =
    useReadNftContractAccountData(address);
  const totalMintPrice = variables
    ? BigInt(variables.amount) *
      (nftContractEssentialData?.mintPricePerNft ?? BigInt(0))
    : BigInt(0);
  const { data: tokenBalance, refetch: refetchTokenBalance } =
    useNftContractPaymentTokenBalance(address as Address, variables?.token);

  const hasEnoughFunds = tokenBalance
    ? tokenBalance.value > totalMintPrice
    : true;

  const isAllMinted = !!nftContractAccountData?.isAllMinted;

  // useEffect(() => {
  //   switchChain({
  //     chainId: somniaDevnet.id,
  //     addEthereumChainParameter: {
  //       iconUrls: ["https://assets.reown.com/reown-profile-pic.png"],
  //       blockExplorerUrls: [somniaDevnet.blockExplorers?.default.url],
  //       chainName: somniaDevnet.name,
  //       nativeCurrency: somniaDevnet.nativeCurrency,
  //       rpcUrls: somniaDevnet.rpcUrls.default.http,
  //     },
  //   });
  // }, [address, switchChain]);

  return {
    hasEnoughFunds,
    isAllMinted,
    mint: mutateAsync,
    isMinting: isPending,
    mintedNftsIds: data,
    lastMintNftParams: variables,
  };
};
