import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useMintFormContext } from "./MintNftForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatUnits } from "viem";
import { ComponentPropsWithRef } from "react";
import clsx from "clsx";
import { useAccount } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NftPaymentToken,
  useNftContractPaymentTokens,
} from "@/hooks/useNftContractPaymentTokens";
import useNftContractPaymentTokenBalance from "@/hooks/useNftContractPaymentTokenBalance";

type PaymentTokenOptionProps = ComponentPropsWithRef<typeof FormItem> & {
  token: NftPaymentToken;
  value: string;
};

const PaymentTokenOption = ({
  token,
  className,
  value,
  ...props
}: PaymentTokenOptionProps) => {
  const { address } = useAccount();
  const { isLoading, data: tokenBalance } = useNftContractPaymentTokenBalance(
    address,
    token
  );

  return (
    <FormItem className={clsx("flex space-y-0", className)} {...props}>
      <FormControl className="peer sr-only">
        <RadioGroupItem value={value} />
      </FormControl>
      <FormLabel
        className={clsx(
          "cursor-pointer transition-colors gap-1 rounded-md border p-3 flex flex-col w-full",
          "peer-focus-visible:ring-offset-2 peer-focus-visible:ring-ring peer-focus-visible:ring-2 peer-aria-checked:border-primary text-muted-foreground peer-aria-checked:text-primary"
        )}
      >
        <span className="flex gap-1 justify-between font-bold">
          {token.meta.symbol} ({token.meta.name}){" "}
          <span className="uppercase font-normal">{token.type}</span>
        </span>
        <div className="text-sm flex flex-wrap gap-1">
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
