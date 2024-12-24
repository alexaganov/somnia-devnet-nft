import React from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { getNftImageUrl } from "@/utils/nft";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2Icon, Wallet } from "lucide-react";
import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";
import { ConnectWalletButton } from "@/components/common/ConnectWaletButton";
import { ConnectKitButton } from "connectkit";

const AccountInfo = () => {
  const { address } = useAccount();
  const { data } = useReadNftContractAccountData(address as Address);
  const { data: nftContractEssentialData } = useReadNftContractEssentialData();

  const mintedNft = data?.nfts?.at(-1);

  const mintedNftImageUrl =
    typeof mintedNft !== "undefined" && nftContractEssentialData
      ? mintedNft.imageUrl
      : null;

  return (
    <div className="w-full flex justify-end max-w-[12.5rem]">
      <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, truncatedAddress }) => {
          if (isConnected) {
            return (
              <div className="flex justify-end w-full gap-2">
                <Button
                  size="icon"
                  className="flex-shrink-0 items-end"
                  variant="outline"
                  onClick={show}
                >
                  {mintedNftImageUrl && (
                    <img className="size-8" src={mintedNftImageUrl} />
                  )}

                  {!mintedNftImageUrl && (
                    <img
                      className="size-8 brightness-0 opacity-20"
                      src={getNftImageUrl(0)}
                    />
                  )}
                  {/* <span className="size-4 rounded-md  bg-neutral-300" /> */}
                </Button>

                <Button
                  variant="outline"
                  onClick={show}
                  className="flex-1 max-sm:hidden"
                >
                  {truncatedAddress}

                  <ChevronDown className="size-4 text-neutral-300" />
                </Button>
              </div>
            );
          }

          return (
            <>
              <Button
                size="icon"
                onClick={show}
                className="flex-shrink-0 sm:hidden"
              >
                {isConnecting && <Loader2Icon className="animate-spin" />}
                {!isConnecting && <Wallet />}
              </Button>

              <ConnectWalletButton className="w-full max-sm:hidden" />
            </>
          );
        }}
      </ConnectKitButton.Custom>
    </div>
  );
};

export default AccountInfo;
