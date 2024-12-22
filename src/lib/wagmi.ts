import { cookieStorage, createConfig, createStorage, http } from "@wagmi/core";
import { somniaDevnet } from "@/constants";
import { getDefaultConfig } from "connectkit";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const config = createConfig(
  getDefaultConfig({
    chains: [somniaDevnet],
    transports: {
      [somniaDevnet.id]: http(somniaDevnet.rpcUrls.default.http[0]),
    },
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    // syncConnectedChain: true,
    walletConnectProjectId: projectId,
    appName: "Somnia Devent NFT",
    appDescription: "Somnia Devent NFT",
    // TODO: update
    appUrl: "https://reown.com/appkit", // origin must match your domain & subdomain
    appIcon: "https://assets.reown.com/reown-profile-pic.png",
  })
);

// export const networks = [somniaDevnet];

//Set up the Wagmi Adapter (Config)
// export const wagmiAdapter = new WagmiAdapter({
//   storage: createStorage({
//     storage: cookieStorage,
//   }),
//   ssr: false,
//   projectId,
//   networks,
//   // chains: [somniaDevnet],
//   // syncConnectedChain: true,
// });

// export const config = wagmiAdapter.wagmiConfig;
