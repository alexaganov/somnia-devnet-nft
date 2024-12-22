import ky from "ky";
import { getErrorMessage } from "./utils/error";

export const getSomniaNetworkStatus = async (): Promise<
  { isLive: true } | { isLive: false; reason: string }
> => {
  try {
    const response = await ky.get("https://dream-rpc.somnia.network/ready", {
      timeout: 1000,
    });

    const data: {
      id: number;
      result: boolean;
      jsonrpc: string;
    } = await response.json();

    if (data.result) {
      return {
        isLive: true,
      };
    }

    return {
      isLive: false,
      reason: "Unknown Error",
    };
  } catch (error) {
    return {
      isLive: false,
      reason: getErrorMessage(error) || "Unknown Error",
    };
  }
};
