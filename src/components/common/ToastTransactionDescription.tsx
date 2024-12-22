import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { Check, Copy, ExternalLink } from "lucide-react";
import { ReactNode } from "react";
import { Chain, Hash } from "viem";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { getExplorerUrl } from "@/utils/web3";
import { cn } from "@/lib/utils";

export const TransactionToastDescription = ({
  description,
  txHash,
  chain,
}: {
  description: ReactNode;
  txHash: Hash;
  chain: Chain;
}) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 800 });
  const CopyIcon = isCopied ? Check : Copy;

  return (
    <div className="flex flex-col">
      {description}
      <Separator className="mt-2 mb-2" />
      <div className="flex gap-1 overflow-hidden items-center">
        <p className="flex truncate min-w-0">
          <span className="truncate flex-1 min-w-0">
            Transaction Hash: {txHash}
          </span>
        </p>
        <Button
          className={cn("flex-shrink-0", {
            "!text-green-500": isCopied,
          })}
          onClick={() => copyToClipboard(txHash)}
          variant="outline"
          size="iconXs"
        >
          <CopyIcon />
        </Button>
        <Button
          className="flex-shrink-0"
          asChild
          variant="outline"
          size="iconXs"
        >
          <a
            target="_blank"
            href={getExplorerUrl({ hash: txHash, chain, type: "tx" })}
          >
            <ExternalLink />
          </a>
        </Button>
      </div>
    </div>
  );
};
