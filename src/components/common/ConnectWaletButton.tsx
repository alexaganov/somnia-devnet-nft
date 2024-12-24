import React from "react";
import { Button, ButtonProps } from "../ui/button";
import { Loader2Icon } from "lucide-react";
import { ConnectKitButton } from "connectkit";

export const ConnectWalletButton = (props: ButtonProps) => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnecting, show }) => {
        return (
          <Button disabled={isConnecting} onClick={show} {...props}>
            {isConnecting && (
              <>
                <Loader2Icon className="animate-spin" />
                Connecting...
              </>
            )}
            {!isConnecting && "Connect Wallet"}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
