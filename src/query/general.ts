import { getSomniaNetworkStatus } from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const getSomniaNetworkStatusQueryOptions = () => {
  return queryOptions({
    queryKey: ["somnia-network-outage"],
    refetchInterval: 500,
    retry: true,
    queryFn: () => getSomniaNetworkStatus(),
  });
};
