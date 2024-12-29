import { somniaDevnet } from "@/constants";
import { createToast, toast } from "@/providers/ToastProvider";
import { getWeb3ErrorMessage } from "@/utils/error";
import { useMutation } from "@tanstack/react-query";
import { Address, Chain } from "viem";
import { useAccount, useSwitchChain } from "wagmi";

export const useEnsureChainAndAccountWithFeedback = () => {
  const { address } = useAccount();
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  return useMutation({
    mutationFn: async ({
      chain: targetChain = somniaDevnet,
      account = address,
    }: { chain?: Chain; account?: Address } = {}): Promise<{
      account: Address;
      chain: Chain;
    }> => {
      if (!account) {
        const errorMessage = "Wallet is not connect";

        toast.error(errorMessage);

        throw new Error(errorMessage);
      }

      if (address !== account) {
        const errorMessage = `Wrong wallet is connected. Please connect ${account}`;

        toast.error(errorMessage);

        throw new Error(errorMessage);
      }

      if (chain && chain.id === targetChain.id) {
        return {
          account,
          chain,
        };
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
          return {
            chain: switchChainResult,
            account,
          };
        }

        switchChainToast.loading({
          description:
            "Please switch the chain in your wallet. Once you open the wallet, you will be prompted to change the chain shortly.",
        });

        const switchedChain = await switchChainPromise;

        switchChainToast.success({
          description: "Success!",
        });

        return {
          account,
          chain: switchedChain,
        };
      } catch (error) {
        switchChainToast.error({
          description: getWeb3ErrorMessage(error),
        });

        throw error;
      }
    },
  });
};
