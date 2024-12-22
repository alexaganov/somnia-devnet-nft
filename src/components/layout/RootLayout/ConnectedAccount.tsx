import { ChevronDown } from "@/components/icons/ChevronDown";
import { shortenIdentifier } from "@/utils";
import { useAppKit } from "@reown/appkit/react";
import clsx from "clsx";
import React from "react";
import { Address } from "viem";

interface ConnectedAccountProps {
  address: Address;
  className?: string;
}

export const ConnectedAccount = ({
  address,
  className,
}: ConnectedAccountProps) => {
  const { open } = useAppKit();

  return (
    <button
      onClick={() => open()}
      className={clsx("btn btn-lg btn-outlined-primary", className)}
    >
      <span className="size-6 rounded-md bg-gray-400 mr-2" />
      {shortenIdentifier(address)}

      <ChevronDown className="size-4 ml-2 text-gray-300" />
    </button>
  );
};
