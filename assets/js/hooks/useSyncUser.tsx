import { useEffect } from "react";
import { useLoad } from ".";
import { currUtcTimestamp } from "../utils";

export function useSyncUser(): any {
  const { data, loading, loaded, loadError, fetchData } = useLoad();
  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    fetchData(
      fetch,
      `/api/user/sync?client_start_time=${currUtcTimestamp()}`,
      requestOptions
    );
  }, []);

  return { data, loading, loaded, loadError };
}
