import { NftData } from "@/types/nft";
import clsx from "clsx";

interface NftListProps {
  nfts: NftData[];
  className?: string;
}

export const NftList = ({ nfts, className }: NftListProps) => {
  return (
    <ul
      className={clsx(
        "grid grid-cols-[repeat(auto-fill,minmax(min(80px,100%),1fr))] gap-2 ",
        className
      )}
    >
      {nfts.map((nft) => {
        return (
          <li
            key={nft.id}
            className="aspect-square flex justify-center items-end rounded-full border overflow-hidden border-border-primary"
          >
            <img
              alt={`Nft #${nft.id}`}
              className="size-[90%]"
              src={nft.imageUrl}
            />
          </li>
        );
      })}
    </ul>
  );
};
