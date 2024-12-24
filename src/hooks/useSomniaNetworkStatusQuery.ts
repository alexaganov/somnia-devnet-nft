import { getSomniaNetworkStatus } from "@/api";
import { useQuery } from "@tanstack/react-query";

export const useSomniaNetworkStatusQuery = () => {
  return useQuery({
    queryKey: ["somnia-network-status"],
    queryFn: () => getSomniaNetworkStatus(),
    retry: true,
    refetchInterval: 5000,
  });
};
