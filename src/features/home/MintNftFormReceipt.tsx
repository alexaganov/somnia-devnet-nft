import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { useMintFormContext } from "./MintNftForm";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";
import { formatUnits } from "viem";

export const MintNftFormReceipt = () => {
  const { watch } = useMintFormContext();
  const { data: nftContractEssentialData } = useReadNftContractEssentialData();
  const { amount, token } = watch();

  const mintAmount = amount?.normalized ?? BigInt(0);
  const totalMintPrice =
    BigInt(mintAmount) *
    (nftContractEssentialData?.mintPricePerNft ?? BigInt(0));

  const formattedTotalPrice = `${formatUnits(
    totalMintPrice,
    token.meta.decimals
  )} ${token.meta.symbol}`;

  const formattedPricePerNft = nftContractEssentialData
    ? `${formatUnits(
        nftContractEssentialData.mintPricePerNft,
        token.meta.decimals
      )} ${token.meta.symbol}`
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
    <Accordion type="single" className="border-t" collapsible>
      <AccordionItem value="total">
        <AccordionTrigger className="text-sm hover:no-underline px-6">
          <div className="flex-col gap-0.5 items-start flex">
            <span className="text-xs text-muted-foreground">
              Total Price (Gas not included)
            </span>
            <span className="font-bold">{formattedTotalPrice}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0 border-t bg-secondary">
          <ul className="flex px-6 py-4 flex-col gap-1.5">
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default MintNftFormReceipt;
