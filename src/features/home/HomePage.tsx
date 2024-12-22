"use client";

import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";
import { getNftImageUrl } from "@/utils/nft";
import React, { useMemo } from "react";
import { Address } from "viem";

import { MintNftForm } from "./MintNftForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "wagmi";

export const HomePage = () => {
  const { address } = useAccount();

  const { data: nftContractEssentialData } = useReadNftContractEssentialData();
  const { data: nftContractAccountData } = useReadNftContractAccountData(
    address as Address
  );

  const nftSlots = useMemo(() => {
    return Array.from(
      { length: Number(nftContractEssentialData?.maxNftAmountPerUser ?? 50) },
      (_, i) => {
        return {
          id: i,
        };
      }
    );
  }, [nftContractEssentialData]);

  return (
    <div className="container grid h-[calc(100vh-var(--header-height))] lg:grid-cols-[20rem_1fr_20rem] gap-4 pb-16 pt-10">
      <div className="w-full">
        <Card className="pb-0 w-full">
          <CardHeader>
            <CardTitle>
              <h1>Somnia Devnet NFT</h1>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <CardDescription>
              <p className="max-w-xl">
                Welcome to Somnia Devnet NFT, a vibrant collection of unique
                pixelated characters brought to life on the Somnia Devnet. Each
                NFT is a handcrafted, standalone piece of digital art,
                celebrating the simplicity and charm of pixel art.
              </p>
            </CardDescription>
          </CardContent>
          <div className="w-full flex">
            <ul className="flex flex-[1_1_0] w-0 px-5">
              {Array.from({ length: 8 }, (_, i) => {
                return (
                  <li
                    className="flex last:flex-shrink-0 flex-shrink min-w-0"
                    key={i}
                  >
                    <img
                      className="aspect-square min-w-20 drop-shadow-[-2px_0_0_rgba(0,0,0,0.5)]"
                      alt="Somnia Devent NFTs Avatar"
                      src={getNftImageUrl(i.toString())}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </div>

      <div className="flex-[1_1_0] w-full min-h-[15rem]">
        <Card className="h-full flex flex-col w-full">
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl">My Collection</h2>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex-[1_1_0] pt-6 overflow-auto">
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(80px,100%),1fr))] gap-2">
              {nftSlots.map((slot) => {
                return (
                  <li
                    key={slot.id}
                    className="border-card bg-neutral-100 aspect-square border rounded-full"
                  ></li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        <MintNftForm />
      </div>

      {/* <h2 className="text-2xl text-center font-bold mb-4">My NFTs</h2>

      <NftList nfts={selfNfts} className="w-full max-w-3xl" /> */}
    </div>
  );
};
