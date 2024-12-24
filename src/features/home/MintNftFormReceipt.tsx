import React from "react";
import { useMintFormContext } from "./MintNftForm";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";
import { formatToken } from "@/utils/web3";

export const MintNftFormReceipt = () => {
  const { watch } = useMintFormContext();
  const { data: nftContractEssentialData } = useReadNftContractEssentialData();
  const { amount, token } = watch();

  const mintAmount = amount?.normalized ?? BigInt(0);
  const totalMintPrice =
    BigInt(mintAmount) *
    (nftContractEssentialData?.mintPricePerNft ?? BigInt(0));

  const formattedTotalPrice = formatToken(totalMintPrice, token.meta);

  const formattedPricePerNft = nftContractEssentialData
    ? formatToken(nftContractEssentialData.mintPricePerNft, token.meta)
    : "N/A";

  const receiptList = [
    {
      id: "amount",
      label: "Amount",
      content: mintAmount,
    },
    {
      id: "price-per-one",
      label: "Price per NFT",
      content: formattedPricePerNft,
    },
    {
      id: "total-price",
      label: "Total Price (Gas not included)",
      content: formattedTotalPrice,
    },
  ];

  return (
    <ul className="flex px-6 py-4 flex-col bg-secondary gap-1.5">
      {receiptList.map(({ id, label, content }) => {
        return (
          <li
            key={id}
            className="flex text-xs flex-wrap gap-0.5 justify-between"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold text-right">{content}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default MintNftFormReceipt;
