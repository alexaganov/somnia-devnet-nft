import { useWindowInnerSize } from "@/hooks/useWindowInnerSize";
import { createSafeContext, useSafeContext } from "@/utils/context";
import { nanoid } from "nanoid";
import React, { ReactNode, useMemo, useState } from "react";
import Confetti from "react-confetti";

interface ContextValue {
  show: (numberOfConfetti: number) => void;
}

const Context = createSafeContext<ContextValue>();

export const useConfetti = () => useSafeContext(Context);

const ConfettiProvider = ({ children }: { children: ReactNode }) => {
  const windowInnerSize = useWindowInnerSize();
  const [reusableConfettiItems, setReusableConfettiItems] = useState<
    { id: string; numberOfPieces: number; isCompleted: boolean }[]
  >([]);

  const releaseConfetti = (id: string) => {
    setReusableConfettiItems((oldState) => {
      return oldState.map((confettiItem) => {
        if (confettiItem.id === id) {
          return {
            ...confettiItem,
            numberOfPieces: 0,
            isCompleted: true,
          };
        }

        return confettiItem;
      });
    });
  };

  const value = useMemo(() => {
    return {
      show: (numberOfPieces: number) => {
        setReusableConfettiItems((oldState) => {
          let hasFoundReusable = false;

          const updatedState = oldState.map((confetti) => {
            if (confetti.isCompleted && !hasFoundReusable) {
              hasFoundReusable = true;

              return {
                ...confetti,
                numberOfPieces,
                isCompleted: false,
              };
            }

            return confetti;
          });

          if (!hasFoundReusable) {
            return [
              ...updatedState,
              {
                id: nanoid(),
                isCompleted: false,
                numberOfPieces,
              },
            ];
          }

          return updatedState;
        });
      },
    };
  }, []);

  return (
    <Context value={value}>
      {children}
      {reusableConfettiItems.map((reusableConfetti) => {
        return (
          <Confetti
            style={{
              position: "fixed",
            }}
            recycle={false}
            key={reusableConfetti.id}
            numberOfPieces={reusableConfetti.numberOfPieces}
            {...windowInnerSize}
            onConfettiComplete={(confetti) => {
              confetti?.reset();
              releaseConfetti(reusableConfetti.id);
            }}
          />
        );
      })}
    </Context>
  );
};

export default ConfettiProvider;
