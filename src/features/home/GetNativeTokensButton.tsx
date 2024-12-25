import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, XIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { SOMNIA_DEVNET_TEST_HOST } from "@/constants";

export const GetNativeButton = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="2xs"
          variant="outline"
          className={className}
        >
          <Plus />
          Add
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={20}
        className="w-[17rem] flex flex-col gap-3 mx-5"
      >
        <header className="flex justify-between">
          <p className="text-sm flex items-center font-bold leading-none">
            Add Native tokens
          </p>

          <PopoverClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="-mt-2 -mr-2"
              size="iconSm"
            >
              <XIcon />
            </Button>
          </PopoverClose>
        </header>

        <p className="text-sm text-muted-foreground">
          To get native tokens, please visit the official Somnia DevNet website.
        </p>

        <Button asChild size="sm" className="w-full">
          <a href={SOMNIA_DEVNET_TEST_HOST} target="_blank">
            Visit
          </a>
        </Button>
      </PopoverContent>
    </Popover>
  );
};
