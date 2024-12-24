"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { config } from "@/lib/wagmi";
import { ToastProvider } from "@/providers/ToastProvider";
import { ConnectKitProvider } from "connectkit";
import ChainManager from "@/providers/ChainManager";
import ConfettiProvider from "@/providers/ConfettiProvider";

const queryClient = new QueryClient();

const Providers = ({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) => {
  const initialState = cookieToInitialState(config as Config, cookies);

  return (
    <ToastProvider>
      <ConfettiProvider>
        <WagmiProvider initialState={initialState} config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <ChainManager>{children}</ChainManager>
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ConfettiProvider>
    </ToastProvider>
  );
};

export default Providers;
