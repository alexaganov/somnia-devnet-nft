import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useMintFormContext } from "./MintNftForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ComponentPropsWithRef, ReactNode, useMemo } from "react";
import clsx from "clsx";
import { useAccount } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import { useNftContractPaymentTokens } from "@/hooks/useNftContractPaymentTokens";
import { PaymentToken } from "@/types/web3";
import usePaymentTokenBalance from "@/hooks/usePaymentTokenBalance";
import { formatToken } from "@/utils/web3";
import { MintErc20Button } from "./MintErc20Button";
import { GetNativeButton } from "./GetNativeTokensButton";

type PaymentTokenOptionProps = ComponentPropsWithRef<typeof FormItem> & {
  token: PaymentToken;
  value: string;
  action: ReactNode;
};

const PaymentTokenOption = ({
  token,
  className,
  value,
  action,
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
            <span>{formatToken(tokenBalance.value, token.meta)}</span>
          )}
          {!tokenBalance && isLoading && (
            <Skeleton className="w-10">&nbsp;</Skeleton>
          )}
          {!tokenBalance && !isLoading && <>N/A</>}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      </FormLabel>
    </FormItem>
  );
};

export const MintNftFormPaymentTokensField = ({
  disabled,
}: {
  disabled?: boolean;
}) => {
  const { control } = useMintFormContext();
  const { erc20, native } = useNftContractPaymentTokens();

  const options = useMemo(() => {
    const result: {
      token: PaymentToken;
      action?: ReactNode;
    }[] = [
      {
        token: native,
        action: <GetNativeButton />,
      },
    ];

    if (erc20) {
      result.push({
        token: erc20,
        action: <MintErc20Button token={erc20} />,
      });
    }

    return result;
  }, [erc20, native]);

  return (
    <FormField
      control={control}
      name="token"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel className="font-bold">Payment Token</FormLabel>
            <FormControl>
              <RadioGroup
                disabled={disabled || field.disabled}
                name={field.name}
                defaultValue={field.value.id}
                onValueChange={(value) =>
                  field.onChange(
                    options.find((option) => option.token.id === value)?.token
                  )
                }
                className="flex flex-col gap-2"
              >
                {options.map(({ token, action }) => {
                  return (
                    <PaymentTokenOption
                      value={token.id}
                      key={token.id}
                      token={token}
                      action={action}
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
