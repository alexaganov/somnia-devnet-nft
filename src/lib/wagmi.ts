import { cookieStorage, createConfig, createStorage, http } from "@wagmi/core";
import { HOST, somniaDevnet } from "@/constants";
import { getDefaultConfig } from "connectkit";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const chains = [somniaDevnet] as const;

export const config = createConfig(
  getDefaultConfig({
    chains,
    transports: {
      [somniaDevnet.id]: http(somniaDevnet.rpcUrls.default.http[0]),
    },
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    walletConnectProjectId: projectId,
    appName: "Somnia Devent NFT",
    appDescription: "Somnia Devent NFT",
    appUrl: HOST,
    appIcon: `${HOST}/icon.png`,
  })
);
