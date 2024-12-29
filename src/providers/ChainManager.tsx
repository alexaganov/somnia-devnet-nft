"use client";

import { somniaDevnet } from "@/constants";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "./ToastProvider";
import { getWeb3ErrorMessage } from "@/utils/error";

// NOTE: we also can use ConnectKit's enforceSupportedChains: true, but for some reason
// it doesn't redirect user to the wallet and there's no clear instruction what to do in
// the modal that appears when network is wrong
const ChainManager = ({ children }: { children?: ReactNode }) => {
  const { disconnect, isPending: isDisconnecting } = useDisconnect();
  const { address, isReconnecting, chain } = useAccount();
  const [shouldSwitchChainInWallet, setShouldSwitchChainInWallet] =
    useState(false);
  const [currentChain] = useState(somniaDevnet);
  const retriesRef = useRef(0);

  const { switchChainAsync } = useSwitchChain();

  // reset when user disconnects
  useEffect(() => {
    if (!address) {
      retriesRef.current = 0;
      setShouldSwitchChainInWallet(false);
    }
  }, [address]);

  useEffect(() => {
    if (isReconnecting || !address || (chain && chain.id === currentChain.id)) {
      return;
    }

    const handleSwitchChain = async () => {
      const switchChainPromise = switchChainAsync({
        chainId: currentChain.id,
      });

      // NOTE: workaround that prompts user to switch chain in the wallet app on mobile devices
      // timeout allow us to check if user currently on mobile device,
      // after that we are showing prompt to make user switch chain in the wallet app
      // On desktop network switches without delays and prompts
      const switchChainResult = await Promise.race([
        switchChainPromise,
        new Promise<null>((res) => {
          setTimeout(() => {
            res(null);
          }, 300);
        }),
      ]);

      if (switchChainResult) {
        toast.info("Chain switched to Somnia Devnet");

        return switchChainResult;
      }

      setShouldSwitchChainInWallet(true);

      try {
        await switchChainPromise;

        toast.info("Chain switched to Somnia Devnet");

        setShouldSwitchChainInWallet(false);
      } catch (error) {
        if (retriesRef.current < 3) {
          retriesRef.current += 1;

          handleSwitchChain();
        }

        toast.error("Couldn't switch chain", {
          duration: Infinity,
          description: (
            <>
              Error: {getWeb3ErrorMessage(error)}
              <br />
              {retriesRef.current >= 3 && (
                <>Please try to disconnect and connect again.</>
              )}
              {retriesRef.current < 3 && (
                <>
                  We've sent another request to your wallet. If nothing happens,
                  please try to disconnect and connect again.
                </>
              )}
            </>
          ),
        });

        console.debug({ error });
      }
    };

    handleSwitchChain();
  }, [
    chain,
    isReconnecting,
    switchChainAsync,
    currentChain,
    address,
    disconnect,
  ]);

  return (
    <>
      {children}
      <Dialog open={shouldSwitchChainInWallet}>
        <DialogContent hideClose>
          <DialogHeader className="items-center">
            <DialogTitle>Unsupported Chain Detected</DialogTitle>
            <DialogDescription className="max-lg:max-w-sm mx-auto flex flex-col">
              It looks like you're on the wrong chain.
              <br />
              Open your wallet, and you'll be prompted to switch shortly.
              <br />
              If nothing happens, try disconnect and connect again.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => disconnect()}
              variant="secondary"
              disabled={isDisconnecting}
            >
              {isDisconnecting && <Loader2 className="animate-spin" />}
              {!isDisconnecting && <>Disconnect</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChainManager;
