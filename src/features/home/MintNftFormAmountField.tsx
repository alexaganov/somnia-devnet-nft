import AmountField from "@/components/common/AmountField";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import React, { useCallback, useEffect } from "react";
import { useMintFormContext } from "./MintNftForm";
import { useReadNftContractAccountData } from "@/hooks/useReadNftContractAccountData";
import { useReadNftContractEssentialData } from "@/hooks/useReadNftContractEssentialData";
import { clamp } from "@/utils";
import { useAccount } from "wagmi";
import { DEFAULT_MAX_NFTS_PER_USER } from "@/constants";
import { Button } from "@/components/ui/button";

export const useNftMintAmountClamp = () => {
  const { address } = useAccount();
  const { data: nftContractEssentialData } = useReadNftContractEssentialData();
  const { data: accountNftContractData } =
    useReadNftContractAccountData(address);

  const minMintAmount = accountNftContractData
    ? accountNftContractData.minMintAmount
    : 1;
  const maxMintAmount = accountNftContractData
    ? accountNftContractData.maxMintAmount
    : nftContractEssentialData?.maxNftAmountPerUser ??
      DEFAULT_MAX_NFTS_PER_USER;

  const clampAmount = useCallback(
    (value?: number) => {
      return clamp(value ?? 0, minMintAmount, maxMintAmount);
    },
    [minMintAmount, maxMintAmount]
  );

  return {
    minMintAmount,
    maxMintAmount,
    clampAmount,
  };
};

const MintNftFormAmountField = ({
  disabled: disabledFromRoot,
}: {
  disabled?: boolean;
}) => {
  const { control, setValue, getValues } = useMintFormContext();
  const { clampAmount, minMintAmount, maxMintAmount } = useNftMintAmountClamp();

  // NOTE: we should clamp in case when amount is set
  // to max and user connect wallet that already has some nfts
  useEffect(() => {
    const clamped = clampAmount(getValues("amount").normalized);

    setValue("amount", {
      raw: clamped,
      normalized: clamped,
    });
  }, [setValue, getValues, clampAmount]);

  return (
    <FormField
      control={control}
      name="amount"
      render={({ field: { value, onChange, onBlur, name, ref, disabled } }) => {
        const clampedValue = clampAmount(value.raw);
        const isMaxed = clampedValue === maxMintAmount;

        return (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="font-bold">Number of NFTs</FormLabel>
              <Button
                disabled={disabledFromRoot || disabled || isMaxed}
                size="2xs"
                type="button"
                variant="secondary"
                onClick={() =>
                  onChange({
                    raw: maxMintAmount,
                    normalized: maxMintAmount,
                  })
                }
              >
                {isMaxed && "Maxed!"}
                {!isMaxed && <>MAX ({maxMintAmount})</>}
              </Button>
            </div>
            <FormControl>
              <AmountField
                value={value?.raw}
                ref={ref}
                disabled={disabledFromRoot || disabled}
                name={name}
                onBlur={() => {
                  onChange({
                    raw: clampedValue,
                    normalized: clampedValue,
                  });
                  onBlur();
                }}
                onValueChange={(value) =>
                  onChange({
                    raw: value.floatValue,
                    normalized: clampAmount(value.floatValue),
                  })
                }
                decrementDisabled={clampedValue <= minMintAmount}
                incrementDisabled={clampedValue >= maxMintAmount}
                onDecrement={() => {
                  const nextValue = Math.max(clampedValue - 1, minMintAmount);

                  onChange({
                    raw: nextValue,
                    normalized: nextValue,
                  });
                }}
                onIncrement={() => {
                  const nextValue = Math.min(clampedValue + 1, maxMintAmount);

                  onChange({
                    raw: nextValue,
                    normalized: nextValue,
                  });
                }}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
};

export default MintNftFormAmountField;
