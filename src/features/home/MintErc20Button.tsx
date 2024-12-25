import { parseUnits } from "viem";
import { useState } from "react";
import { useAccount } from "wagmi";
import { PaymentTokenErc20 } from "@/types/web3";
import { useMintErc20TestWithFeedback } from "@/hooks/useMintErc20Test";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, XIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PopoverClose } from "@radix-ui/react-popover";
import { useErc20TokenBalance } from "@/hooks/useErc20TokenBalance";

const options = [
  {
    id: "1",
    amount: 1,
  },
  {
    id: "2",
    amount: 10,
  },
  {
    id: "3",
    amount: 100,
  },
];

export const MintErc20Button = ({
  token,
  className,
}: {
  token: PaymentTokenErc20;
  className?: string;
}) => {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const { mutateAsync: mint, isPending: isMinting } =
    useMintErc20TestWithFeedback();

  const { refetch: refetchErc20TokenBalance } = useErc20TokenBalance(
    address,
    token.contract
  );

  const [selectedOptionId, setSelectedOptionsId] = useState(options[0].id);
  const selectedOption = options.find(
    (option) => option.id === selectedOptionId
  );

  const handleMintButtonClick = async () => {
    if (!selectedOption) {
      return;
    }

    setOpen(false);

    try {
      await mint({
        amount: parseUnits(
          selectedOption.amount.toString(),
          token.meta.decimals
        ),
        token,
      });

      refetchErc20TokenBalance();
    } catch (error) {
      console.debug({ error });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="2xs"
          variant="outline"
          className={className}
          disabled={isMinting}
        >
          {isMinting && <Loader2 className="animate-spin" />}
          {!isMinting && <Plus />}
          Add
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={20}
        className="w-[17rem] flex flex-col gap-3 mx-5"
      >
        <header className="flex justify-between">
          <p className="text-sm flex items-center font-bold leading-none">
            Add {token.meta.name} tokens
          </p>

          <PopoverClose asChild>
            <Button
              type="button"
              className="-mt-2 -mr-2"
              variant="secondary"
              size="iconSm"
            >
              <XIcon />
            </Button>
          </PopoverClose>
        </header>

        <ToggleGroup
          variant="outline"
          value={selectedOptionId}
          onValueChange={(value) => {
            // makes it impossible to unselect single option
            if (value) {
              setSelectedOptionsId(value);
            }
          }}
          type="single"
        >
          {options.map(({ id, amount }) => {
            return (
              <ToggleGroupItem className="w-full" key={id} value={id}>
                {amount} {token.meta.symbol}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>

        <Button onClick={handleMintButtonClick} size="sm" className="w-full">
          Add
        </Button>
      </PopoverContent>
    </Popover>
  );
};
