import {
  useAppKit,
  useAppKitAccount,
  useAppKitState,
} from "@reown/appkit/react";
import { useCallback, useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export const useConnectWalletAsync = () => {
  const { open: isConnectWalletModalOpen } = useAppKitState();
  const { open: openConnectWalletModal } = useAppKit();
  const connectPromiseResolversRef =
    useRef<null | PromiseWithResolvers<string>>(null);
  const { address } = useAccount();

  const addressRef = useRef(address);

  addressRef.current = address;

  useEffect(() => {
    if (!connectPromiseResolversRef.current || isConnectWalletModalOpen) {
      return;
    }

    if (address) {
      connectPromiseResolversRef.current.resolve(address);
    } else {
      connectPromiseResolversRef.current.reject("User rejected connection");
    }

    connectPromiseResolversRef.current = null;
  }, [isConnectWalletModalOpen, address]);

  return useCallback(async () => {
    if (address) {
      return address;
    }

    await openConnectWalletModal();

    const resolvers = Promise.withResolvers<string>();

    connectPromiseResolversRef.current = resolvers;

    return resolvers.promise;
  }, [openConnectWalletModal, address]);
};
