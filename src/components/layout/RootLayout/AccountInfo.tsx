import React, { Suspense } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { getNftImageUrl } from "@/utils/nft";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2Icon, Wallet } from "lucide-react";
import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { ConnectWalletButton } from "@/components/common/ConnectWaletButton";
import { ConnectKitButton } from "connectkit";
import { Skeleton } from "@/components/ui/skeleton";

const AccountInfo = () => {
  const { address } = useAccount();
  const { data } = useReadNftContractAccountData(address as Address);
  const lastMintedNft = data?.nfts?.at(-1);

  return (
    <div className="flex justify-end">
      <Suspense fallback={<>Loading</>}>
        <ConnectKitButton.Custom>
          {({ isConnected, isConnecting, show, truncatedAddress }) => {
            if (isConnected) {
              return (
                <div className="flex peer justify-end w-full gap-2">
                  <Button
                    size="icon"
                    className="flex-shrink-0 items-end"
                    variant="outline"
                    onClick={show}
                  >
                    {lastMintedNft && (
                      <img className="size-8" src={lastMintedNft.imageUrl} />
                    )}

                    {!lastMintedNft && (
                      <img
                        className="size-8 brightness-0 opacity-20"
                        src={getNftImageUrl(-1)}
                      />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={show}
                    className="flex-1 max-sm:hidden w-[10rem]"
                  >
                    {truncatedAddress}

                    <ChevronDown className="size-4 text-neutral-300" />
                  </Button>
                </div>
              );
            }

            return (
              <div className="peer">
                <Button
                  size="icon"
                  onClick={show}
                  className="flex-shrink-0 sm:hidden"
                >
                  {isConnecting && <Loader2Icon className="animate-spin" />}
                  {!isConnecting && <Wallet />}
                </Button>

                <ConnectWalletButton className="w-[13rem] max-sm:hidden" />
              </div>
            );
          }}
        </ConnectKitButton.Custom>

        {/* Shows skeleton only during dehydration when connect kit button is not rendered yet */}
        <Skeleton className="peer-first:hidden w-10 sm:w-[13rem] h-10" />
      </Suspense>
    </div>
  );
};

export default AccountInfo;
