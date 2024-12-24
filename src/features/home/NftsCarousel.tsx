import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { NftData } from "@/types/nft";
import React from "react";

interface NftsCarouselProps {
  nfts: NftData[];
  size: number;
}

export const NftsCarousel = ({ nfts, size }: NftsCarouselProps) => {
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
                    src={imageUrl}
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
