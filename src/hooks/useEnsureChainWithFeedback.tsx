import { createToast } from "@/providers/ToastProvider";
import { getWeb3ErrorMessage } from "@/utils/error";
import { useMutation } from "@tanstack/react-query";
import { Chain } from "viem";
import { useAccount, useSwitchChain } from "wagmi";

export const useEnsureChainWithFeedback = () => {
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  return useMutation({
    mutationFn: async (targetChain: Chain) => {
      if (chain && chain.id === targetChain.id) {
        return chain;
      }

      const switchChainToast = createToast("Switch Chain");

      try {
        const switchChainPromise = switchChainAsync({
          chainId: targetChain.id,
        });

        // NOTE: workaround that prompts user to switch chain in the wallet app on mobile devices
        // Timeout allow us to check if user currently on mobile device,
        // after that we are showing prompt to make user switch chain in the wallet app
        // On desktop network switches without delays and prompts
        const switchChainResult = await Promise.race([
          switchChainPromise,
          new Promise<null>((res) => {
            setTimeout(() => {
              res(null);
            }, 300);
          }),
        ]);

        if (switchChainResult) {
          return switchChainResult;
        }

        switchChainToast.loading({
          description:
            "Please switch the chain in your wallet. Once you open the wallet, you will be prompted to change the chain shortly.",
        });

        const switchedChain = await switchChainPromise;

        switchChainToast.success({
          description: "Success!",
        });

        return switchedChain;
      } catch (error) {
        switchChainToast.error({
          description: getWeb3ErrorMessage(error),
        });

        throw error;
      }
    },
  });
};
