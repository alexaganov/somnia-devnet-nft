"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState, type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { config } from "@/lib/wagmi";
import { ToastProvider } from "@/providers/ToastProvider";
import { ConnectKitProvider } from "connectkit";
import ChainManager from "@/providers/ChainManager";
import ConfettiProvider from "@/providers/ConfettiProvider";
import dynamic from "next/dynamic";

const queryClient = new QueryClient();

const ReactQueryDevtoolsProduction = dynamic(
  () =>
    import("@tanstack/react-query-devtools/production").then((d) => ({
      default: d.ReactQueryDevtools,
    })),
  {
    ssr: false,
  }
);

declare global {
  interface Window {
    toggleDevtools?: () => void;
  }
}

const Providers = ({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) => {
  const [showDevtools, setShowDevtools] = useState(
    process.env.NODE_ENV === "development"
  );
  const initialState = cookieToInitialState(config as Config, cookies);

  useEffect(() => {
    window.toggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <ToastProvider>
      <ConfettiProvider>
        <WagmiProvider initialState={initialState} config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <ChainManager>{children}</ChainManager>
            </ConnectKitProvider>

            {showDevtools && <ReactQueryDevtoolsProduction />}
          </QueryClientProvider>
        </WagmiProvider>
      </ConfettiProvider>
    </ToastProvider>
  );
};

export default Providers;
