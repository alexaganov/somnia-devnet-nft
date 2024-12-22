import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import React from "react";
import { ConnectedAccount } from "./ConnectedAccount";
import { Address } from "viem";
import clsx from "clsx";
import {
  useAccount,
  useChains,
  useReadContract,
  useReadContracts,
} from "wagmi";
import { NFT_IMAGE_BASE_URL, NFT_CONTRACT } from "@/constants";
import { shortenIdentifier } from "@/utils";
import { getNftImageUrl } from "@/utils/nft";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2Icon, Wallet } from "lucide-react";
import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";
import { ConnectWalletButton } from "@/components/common/ConnectWaletButton";
import { ConnectKitButton } from "connectkit";

// const useAccount = () => {
//   const { address, isConnected, status } = useAppKitAccount();

//   const isConnecting =
//     !status || ["reconnecting", "connecting"].includes(status);
//   const isInitializing = !status;

//   return {
//     isConnecting,
//     isConnected,
//     address,
//     isInitializing,
//   };
// };

const AccountInfo = () => {
  // NOTE: use useAccount instead of useAppKitAccount because
  // useAppKitAccount doesn't return address during hydration
  // even though we have it as initial state from cookies
  // const cookieAccount = useAccount();
  // const { address, isConnected, isConnecting, chain, chainId } = useAccount();

  const clientAccount = useAccount();

  const { address, isConnected, chain, status } = clientAccount;

  const isConnecting = status === "connecting";
  console.log({ chain, clientAccount });

  const { data } = useReadNftContractAccountData(address as Address);
  const { data: nftContractEssentialData } = useReadNftContractEssentialData();

  const mintedNft = data?.nfts?.at(-1);

  // console.log({ address, cookieAccount });

  const mintedNftImageUrl =
    typeof mintedNft !== "undefined" && nftContractEssentialData
      ? mintedNft.imageUrl
      : null;

  return (
    <div className="w-full flex justify-end max-w-[12.5rem]">
      <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, address, truncatedAddress }) => {
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
                  {/* {shortenIdentifier(address as Address)} */}

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
