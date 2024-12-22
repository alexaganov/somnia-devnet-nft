import React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import clsx from "clsx";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { Ref } from "react-hook-form";

interface AmountFieldProps extends NumericFormatProps {
  onIncrement?: () => void;
  onDecrement?: () => void;
  inputClassName?: string;
  decrementClassName?: string;
  decrementDisabled?: boolean;
  incrementClassName?: string;
  incrementDisabled?: boolean;
  ref?: Ref;
}

const AmountField = ({
  onIncrement,
  onDecrement,
  decrementDisabled,
  decrementClassName,
  incrementDisabled,
  incrementClassName,
  inputClassName,
  disabled,
  className,
  ...props
}: AmountFieldProps) => {
  return (
    <div className={clsx("flex items-center", className)}>
      <Button
        size="icon"
        variant="outline"
        type="button"
        disabled={disabled || decrementDisabled}
        onClick={onDecrement}
        className={clsx(
          decrementClassName,
          "flex-shrink-0 -mr-px rounded-r-none"
        )}
      >
        <Minus className="size-6" />
      </Button>

      <NumericFormat
        customInput={Input}
        className={clsx(
          inputClassName,
          "text-center relative rounded-none w-full"
        )}
        allowNegative={false}
        decimalScale={0}
        disabled={disabled}
        allowLeadingZeros={false}
        {...props}
      />

      <Button
        size="icon"
        variant="outline"
        type="button"
        disabled={disabled || incrementDisabled}
        onClick={onIncrement}
        className={clsx(
          incrementClassName,
          "flex-shrink-0 -ml-px rounded-l-none"
        )}
      >
        <Plus className="size-6" />
      </Button>
    </div>
  );
};

export default AmountField;
