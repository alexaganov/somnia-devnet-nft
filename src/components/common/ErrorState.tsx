import React, { ReactNode } from "react";
import { Button } from "../ui/button";

interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  onTryAgain?: () => void;
}

export const ErrorState = ({
  title = "Error",
  description = "Something went wrong",
  onTryAgain,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col gap-3 items-center">
      {(!!title || !!description) && (
        <div className="text-destructive text-center">
          {title && <h3 className="text-lg font-bold ">{title}</h3>}

          {description && <p>{description}</p>}
        </div>
      )}

      <Button onClick={onTryAgain} variant="secondary">
        Try Again
      </Button>
    </div>
  );
};
