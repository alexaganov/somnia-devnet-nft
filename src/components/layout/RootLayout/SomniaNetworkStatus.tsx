import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSomniaNetworkStatusQuery } from "@/hooks/useSomniaNetworkStatusQuery";
import { Radio, ServerCrash } from "lucide-react";
import React, { useState } from "react";

const SomniaNetworkStatus = ({ className }: { className?: string }) => {
  const { data, isLoading } = useSomniaNetworkStatusQuery();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !data) {
    return <Skeleton className="size-10" />;
  }

  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={500}
        onOpenChange={setIsOpen}
        open={data ? isOpen : false}
      >
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsOpen(true)}
            className={className}
            size="icon"
            variant="outline"
          >
            {!data.isLive && <ServerCrash className="text-destructive" />}
            {data.isLive && <Radio className="text-green-600" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="mx-6 max-w-[14rem]">
          <p>
            The Somnia Devnet network is&nbsp;
            {data?.isLive && <>live and operational</>}
            {!data?.isLive && <>currently unavailable</>}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SomniaNetworkStatus;
