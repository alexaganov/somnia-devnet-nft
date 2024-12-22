"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { config, projectId } from "@/lib/wagmi";
import { ToastProvider } from "@/providers/ToastProvider";
import { ConnectKitProvider } from "connectkit";

// Set up queryClient
// const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
// const metadata = {
//   name: "Somnia Assignment",
//   description: "AppKit",
//   url: "https://reown.com/appkit", // origin must match your domain & subdomain
//   icons: ["https://assets.reown.com/reown-profile-pic.png"],
// };

// Create the modal
// const modal = createAppKit({
//   adapters: [wagmiAdapter],
//   projectId,
//   // allowUnsupportedChain: false,
//   networks: [somniaDevnet],
//   defaultNetwork: somniaDevnet,
//   features: {
//     email: false,
//     socials: [],
//     swaps: false,
//   },
//   metadata: metadata,
// });

// modal.switchNetwork({
//     chainNamespace: ''
//   })

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
      <WagmiProvider initialState={initialState} config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ToastProvider>
  );
};

export default Providers;
