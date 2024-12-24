"use client";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";

import clsx from "clsx";
import { useAccount } from "wagmi";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useForm, useFormContext } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { ErrorState } from "@/components/common/ErrorState";
import { MintNftFormPaymentTokensField } from "./MintNftFormPaymentTokensField";
import { useNftContractPaymentTokens } from "@/hooks/useNftContractPaymentTokens";
import { PaymentToken } from "@/types/web3";
import MintNftFormAmountField from "./MintNftFormAmountField";
import MintNftFormReceipt from "./MintNftFormReceipt";
import { ConnectWalletButton } from "@/components/common/ConnectWaletButton";

import { Loader2Icon } from "lucide-react";
import { useMintNft } from "@/hooks/useMintNft";
import { toast } from "@/providers/ToastProvider";
import { NftsCarousel } from "./NftsCarousel";
import { useRef } from "react";
import { useConfetti } from "@/providers/ConfettiProvider";

export interface MintNftFormData {
  amount: {
    raw?: number;
    normalized: number;
  };
  token: PaymentToken;
}

export const useMintFormContext = () => useFormContext<MintNftFormData>();

const MintNftFormContent = ({ className }: { className?: string }) => {
  const confetti = useConfetti();
  const { isConnected } = useAccount();
  const { nativePaymentToken } = useNftContractPaymentTokens();
  const { data: nftContractEssentialData } = useReadNftContractEssentialData();

  const defaultValues = useRef<MintNftFormData>({
    token: nativePaymentToken,
    amount: {
      raw: 1,
      normalized: 1,
    },
  }).current;

  const mintNftForm = useForm<MintNftFormData>({
    defaultValues,
  });

  const formData = mintNftForm.watch();

  const { hasEnoughFunds, isAllMinted, mint, isMinting } = useMintNft({
    amount: formData.amount.normalized,
    token: formData.token,
  });

  const handleSubmit = mintNftForm.handleSubmit(async () => {
    try {
      const mintedNfts = await mint();

      toast("Congratulations on Your Minted NFTs!", {
        duration: Infinity,
        closeButton: true,
        description: (
          <>
            <p className="mb-2">
              Your NFTs have been successfully minted and are ready for you to
              explore.
            </p>
            <NftsCarousel size={4} nfts={mintedNfts} />
          </>
        ),
      });

      confetti.show(500);
    } catch (error) {
      console.debug({ error });
    }
  });

  const isSubmitButtonDisabled = !hasEnoughFunds || isAllMinted || isMinting;

  let submitButtonLabel = "Mint";

  if (isAllMinted) {
    submitButtonLabel = "All Minted";
  } else if (!hasEnoughFunds) {
    submitButtonLabel = "Insufficient Funds";
  }

  return (
    <Form {...mintNftForm}>
      <form className={clsx(className)} onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-bold">
                Mint Somnia Devnet NFTs in an Instant
              </h2>
            </CardTitle>
            <CardDescription>
              <p className="text-sm text-muted-foreground">
                Over{" "}
                <span className="font-bold">
                  {nftContractEssentialData?.totalMinted ?? BigInt(0)} NFTs
                </span>{" "}
                minted so far. Mint yours before&nbsp;it’s&nbsp;too late
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-5 flex-col">
            {/* NOTE: we are not using useForm({ disabled: isMinting }) because when it's changing whole form resets */}
            <MintNftFormPaymentTokensField disabled={isMinting} />
            <MintNftFormAmountField disabled={isMinting} />
          </CardContent>

          <MintNftFormReceipt />

          <CardFooter className="mt-6">
            {isConnected && (
              <>
                <Button
                  size="lg"
                  type="submit"
                  disabled={isSubmitButtonDisabled}
                  className="w-full"
                >
                  {isMinting && <Loader2Icon className="animate-spin" />}

                  {!isMinting && submitButtonLabel}
                </Button>
              </>
            )}

            {!isConnected && (
              <ConnectWalletButton size="lg" className="w-full" />
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export const MintNftForm = () => {
  const nftContractEssentialDataQuery = useReadNftContractEssentialData();
  const { query: paymentTokensQuery } = useNftContractPaymentTokens();

  const isDataLoaded =
    !!nftContractEssentialDataQuery.data && !!paymentTokensQuery.data;
  const isError =
    paymentTokensQuery.isError || nftContractEssentialDataQuery.isError;

  const refetch = () => {
    if (!nftContractEssentialDataQuery.data) {
      nftContractEssentialDataQuery.refetch();
    }

    if (!paymentTokensQuery.data) {
      paymentTokensQuery.refetch();
    }
  };

  if (isDataLoaded) {
    return <MintNftFormContent />;
  }

  // should be height of the rendered content
  const minHeightClassName = "min-h-[36.75rem]";

  if (isError) {
    <Card
      className={clsx(
        "p-6 flex justify-center items-center",
        minHeightClassName
      )}
    >
      <ErrorState onTryAgain={refetch} />
    </Card>;
  }

  return <Skeleton className={minHeightClassName} />;
};
