"use client";
import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";

import { getNftImageUrl } from "@/utils/nft";

import clsx from "clsx";
import { Address } from "viem";
import { useAccount } from "wagmi";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useForm, useFormContext } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { ErrorState } from "@/components/common/ErrorState";
import { MintNftFormPaymentTokensField } from "./MintNftFormPaymentTokensField";
import {
  NftPaymentToken,
  useNftContractPaymentTokens,
} from "@/hooks/useNftContractPaymentTokens";
import MintNftFormAmountField from "./MintNftFormAmountField";
import MintNftFormReceipt from "./MintNftFormReceipt";
import { ConnectWalletButton } from "@/components/common/ConnectWaletButton";
import useNftContractPaymentTokenBalance from "@/hooks/useNftContractPaymentTokenBalance";

import { Loader2Icon } from "lucide-react";
import { useMintNft } from "@/hooks/useMintNft";
import { toast } from "@/providers/ToastProvider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { NftData } from "@/types/nft";

// const MintItTokenButton = () => {
//   const { writeContract, data: hash } = useWriteContract();

//   const { data: receipt } = useWaitForTransactionReceipt({
//     query: {
//       enabled: false,
//     },
//     hash,
//   });

//   // console.log({ hash, receipt });

//   const handleClick = async () => {
//     writeContract({
//       ...INSOMNIA_TOKEN_CONTRACT,
//       functionName: "mint",
//       args: [BigInt(1)],
//     });
//   };

//   return <button onClick={handleClick}>Mint IT</button>;
// };

export interface MintNftFormData {
  amount: {
    raw?: number;
    normalized: number;
  };
  token: NftPaymentToken;
}

export const useMintFormContext = () => useFormContext<MintNftFormData>();

const NftsCarousel = ({ nfts, size }: { nfts: NftData[]; size: number }) => {
  return (
    <Carousel className="flex flex-col -mx-4 gap-2">
      <CarouselContent contentClassName="m-0" className="px-3">
        {nfts.map(({ id, imageUrl }) => {
          return (
            <CarouselItem
              style={{
                flexBasis: `${100 / size}%`,
              }}
              key={id}
              className="p-0"
            >
              <div className="px-1">
                <Card className="items-end aspect-square flex justify-center">
                  <img
                    alt={`NFT #${id}`}
                    className="size-[90%]"
                    src={getNftImageUrl(imageUrl)}
                  />
                </Card>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {nfts.length > size && (
        <div className="w-full flex gap-2 justify-center">
          <CarouselPrevious className="relative transform-none inset-0" />
          <CarouselNext className="relative transform-none inset-0" />
        </div>
      )}
    </Carousel>
  );
};

const MintNftFormContent = ({ className }: { className?: string }) => {
  const { address, isConnected } = useAccount();
  const { paymentTokens } = useNftContractPaymentTokens();

  const { refetch: refetchNftContractAccountData } =
    useReadNftContractAccountData(address as Address);

  const { hasEnoughFunds, isAllMinted, mint, isMinting } = useMintNft();

  // const defaultValues = useMemo(() => {
  //   return {
  //     amount: {
  //       normalized: lastMintNftParams?.amount ?? 1,
  //       raw: lastMintNftParams?.amount ?? 1
  //     },
  //     token: lastMintNftParams?.token ?? paymentTokens[0]
  //   } as MintNftFormData
  // }, [lastMintNftParams, paymentTokens[0]])

  const mintNftForm = useForm<MintNftFormData>({
    defaultValues: {
      token: paymentTokens[0],
      amount: {
        raw: 1,
        normalized: 1,
      },
    },
  });

  const formData = mintNftForm.watch();

  const { refetch: refetchAccountBalance } = useNftContractPaymentTokenBalance(
    address,
    formData.token
  );

  // useEffect(() => {
  //   toast("Congratulations on Your Minted NFTs!", {
  //     duration: Infinity,
  //     closeButton: true,
  //     description: (
  //       <>
  //         <p className="mb-2">
  //           Your NFTs have been successfully minted and are ready for you to
  //           explore.
  //         </p>
  //         <NftsCarousel size={4} nfts={} />
  //       </>
  //     ),
  //   });
  // }, []);

  const handleSubmit = mintNftForm.handleSubmit(async (data) => {
    try {
      const mintdNfts = await mint({
        amount: data.amount.normalized,
        token: data.token,
      });

      toast("Congratulations on Your Minted NFTs!", {
        duration: Infinity,
        closeButton: true,
        description: (
          <>
            <p className="mb-2">
              Your NFTs have been successfully minted and are ready for you to
              explore.
            </p>
            <NftsCarousel size={4} nfts={mintdNfts} />
          </>
        ),
      });

      Promise.all([refetchNftContractAccountData(), refetchAccountBalance()]);
    } catch (error) {
      console.debug({ error });
    }
  });

  const isSubmitButtonDisabled = !hasEnoughFunds || isAllMinted || isMinting;

  let submitButtonLabel = "Mint";

  if (isAllMinted) {
    submitButtonLabel = "NFT Limit Per Account Reached";
  } else if (!hasEnoughFunds) {
    submitButtonLabel = "Insufficient Funds";
  }

  return (
    <Card className={clsx(className)}>
      <Form {...mintNftForm}>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl">Mint Right Now</h2>
            </CardTitle>
          </CardHeader>

          <Separator className="mb-6" />

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
        </form>
      </Form>
    </Card>
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

  const minHeightClassName = "min-h-[34.4375rem]";

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
