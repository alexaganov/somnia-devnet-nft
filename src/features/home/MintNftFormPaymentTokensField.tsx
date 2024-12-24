import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useMintFormContext } from "./MintNftForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatUnits, parseUnits } from "viem";
import { ComponentPropsWithRef, useState } from "react";
import clsx from "clsx";
import { useAccount } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import { useNftContractPaymentTokens } from "@/hooks/useNftContractPaymentTokens";
import { PaymentToken } from "@/types/web3";
import { PaymentTokenErc20 } from "@/types/web3";
import usePaymentTokenBalance from "@/hooks/usePaymentTokenBalance";
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

type PaymentTokenOptionProps = ComponentPropsWithRef<typeof FormItem> & {
  token: PaymentToken;
  value: string;
};

const MintErc20Button = ({
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
        token: token.contract,
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
        className="w-[17rem] flex flex-col gap-4 mx-5"
      >
        <header className="flex justify-between">
          <p className="text-sm flex items-center font-bold leading-none">
            Add {token.meta.name} tokens
          </p>

          <PopoverClose asChild>
            <Button type="button" variant="secondary" size="iconSm">
              <XIcon />
            </Button>
          </PopoverClose>
        </header>

        <ToggleGroup
          variant="outline"
          value={selectedOptionId}
          onValueChange={(value) => {
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

const PaymentTokenOption = ({
  token,
  className,
  value,
  ...props
}: PaymentTokenOptionProps) => {
  const { address } = useAccount();
  const {
    activeToken: { isLoading, data: tokenBalance },
  } = usePaymentTokenBalance(address, token);

  return (
    <FormItem className={clsx("flex space-y-0", className)} {...props}>
      <FormControl className="peer sr-only">
        <RadioGroupItem value={value} />
      </FormControl>
      <FormLabel
        className={clsx(
          "cursor-pointer transition-colors gap-1 flex-col rounded-md border p-3 flex w-full",
          "peer-focus-visible:ring-offset-2 peer-focus-visible:ring-ring peer-focus-visible:ring-2 peer-aria-checked:border-primary text-muted-foreground peer-aria-checked:text-primary"
        )}
      >
        <span className="flex gap-1 justify-between font-bold">
          {token.meta.symbol} ({token.meta.name}){" "}
          <span className="uppercase font-normal">{token.type}</span>
        </span>
        <div className="text-sm flex w-full flex-wrap gap-1">
          Balance:
          {tokenBalance && (
            <span>
              {formatUnits(tokenBalance.value, tokenBalance.decimals)}{" "}
              {tokenBalance.symbol}
            </span>
          )}
          {!tokenBalance && isLoading && (
            <Skeleton className="w-10">&nbsp;</Skeleton>
          )}
          {!tokenBalance && !isLoading && <>N/A</>}
          {token.type === "erc20" && (
            <MintErc20Button className="ml-auto" token={token} />
          )}
        </div>
      </FormLabel>
    </FormItem>
  );
};

export const MintNftFormPaymentTokensField = ({
  disabled: disabledFromRoot,
}: {
  disabled?: boolean;
}) => {
  const { control } = useMintFormContext();
  const { paymentTokens } = useNftContractPaymentTokens();

  return (
    <FormField
      control={control}
      name="token"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>Payment Token</FormLabel>
            <FormControl>
              <RadioGroup
                disabled={disabledFromRoot || field.disabled}
                name={field.name}
                defaultValue={field.value.id}
                onValueChange={(value) =>
                  field.onChange(
                    paymentTokens.find((token) => token.id === value)
                  )
                }
                className="flex flex-col gap-2"
              >
                {paymentTokens.map((paymentToken) => {
                  return (
                    <PaymentTokenOption
                      value={paymentToken.id}
                      key={paymentToken.id}
                      token={paymentToken}
                      // onClick={() => field.onChange(paymentToken)}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
};
