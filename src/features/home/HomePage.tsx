"use client";

import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";
import React, { useMemo } from "react";
import { Address } from "viem";

import { MintNftForm } from "./MintNftForm";

import { useAccount } from "wagmi";
import { getNftImageUrl } from "@/utils/nft";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_MAX_NFTS_PER_USER } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/common/ErrorState";

export const HomePage = () => {
  const { address } = useAccount();

  const { data: nftContractEssentialData } = useReadNftContractEssentialData();
  const nftContractAccountData = useReadNftContractAccountData(
    address as Address
  );

  const nftSlots = useMemo(() => {
    return Array.from(
      {
        length: Number(
          nftContractEssentialData?.maxNftAmountPerUser ??
            DEFAULT_MAX_NFTS_PER_USER
        ),
      },
      (_, i) => {
        const nft = nftContractAccountData.data?.nfts.at(i);

        if (nft) {
          return {
            id: nft.id,
            imageUrl: nft.imageUrl,
            isPlaceholder: false,
          };
        }

        return {
          id: `placeholder-${i}`,
          isPlaceholder: true,
          imageUrl: getNftImageUrl(
            (nftContractEssentialData?.currentNftId ?? BigInt(0)) + BigInt(i)
          ),
        };
      }
    );
  }, [nftContractEssentialData, nftContractAccountData.data]);

  return (
    <div className="container flex-col flex items-center pt-16 pb-28">
      <div className="w-full border-b max-w-sm mx-auto mb-4 flex">
        <ul className="flex flex-[1_1_0] w-0 px-5">
          {Array.from({ length: 8 }, (_, i) => {
            return (
              <li
                className="flex relative last:flex-shrink-0 flex-shrink min-w-0"
                key={i}
              >
                <div className="absolute z-[2] peer size-full left-0 top-0" />
                <img
                  className="aspect-square min-w-20 origin-bottom peer-hover:z-[1] transition-transform peer-hover:scale-125 drop-shadow-[-2px_0_0_rgba(0,0,0,0.5)]"
                  alt="Somnia Devent NFTs Avatar"
                  src={getNftImageUrl(i.toString())}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <h1 className="font-bold text-2xl text-center mb-2">Somnia Devnet NFT</h1>

      <p className="max-w-md text-center text-sm">
        Welcome to Somnia Devnet NFT, a vibrant collection of unique pixelated
        characters brought to life on the Somnia Devnet. Each NFT is a
        handcrafted, standalone piece of digital art, celebrating the simplicity
        and charm of pixel art.
      </p>

      <div
        aria-hidden="true"
        className="select-none font-mono opacity-20 my-10"
      >
        ***
      </div>

      <div className="w-full max-w-sm">
        <MintNftForm />
      </div>

      <div
        aria-hidden="true"
        className="select-none font-mono opacity-20 my-10"
      >
        ***
      </div>

      <h2 className="text-lg font-bold">My Collection</h2>

      <div className="mb-4">
        {nftContractEssentialData && nftContractEssentialData ? (
          <span className="text-muted-foreground text-sm font-mono">
            {nftContractAccountData.data?.nfts.length ?? 0}/
            {nftContractEssentialData?.maxNftAmountPerUser}
          </span>
        ) : (
          <Skeleton className="h-6 w-14" />
        )}
      </div>

      {!nftContractAccountData.data && nftContractAccountData.isError && (
        <ErrorState onTryAgain={nftContractAccountData.refetch} />
      )}

      {(!nftContractAccountData.isError || !!nftContractAccountData.data) && (
        <ul className="grid w-full max-w-[60.75rem] select-none grid-cols-[repeat(auto-fill,minmax(min(90px,100%),1fr))] gap-x-2 gap-y-4">
          {nftSlots.map((slot) => {
            if (nftContractAccountData.isLoading) {
              return (
                <Skeleton
                  key={slot.id}
                  className="rounded-full aspect-square"
                />
              );
            }

            return (
              <li
                key={slot.id}
                className="aspect-square flex flex-col gap-0.5 items-center relative"
              >
                <div className="h-full rounded-full w-full flex justify-center items-end border shadow-sm overflow-hidden border-border-primary">
                  <img
                    draggable={false}
                    alt={`Nft #${slot.id}`}
                    className={clsx("size-[90%]", {
                      "brightness-0 opacity-10": slot.isPlaceholder,
                    })}
                    src={slot.imageUrl}
                  />
                </div>

                {!slot.isPlaceholder && (
                  <Badge
                    size="sm"
                    variant="secondary"
                    className={cn(
                      "mx-auto font-mono absolute bottom-0 translate-y-1/2 text-muted-foreground"
                    )}
                  >
                    #{slot.id}
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
