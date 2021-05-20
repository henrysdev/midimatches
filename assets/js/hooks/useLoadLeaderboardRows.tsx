import { useEffect } from "react";
import { useLoad } from ".";
import { LeaderboardRankingsPayload } from "../types";

export function useLoadLeaderboardRows(pageIdx: number, pageSize: number): any {
  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    fetchData,
  } = useLoad();

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    fetchData(
      fetch,
      `/api/stats/rankings?offset=${pageIdx * pageSize}&limit=${pageSize}`,
      requestOptions
    );
  }, [pageIdx]);

  return { data, httpStatus, loading, loaded, loadError };
}
