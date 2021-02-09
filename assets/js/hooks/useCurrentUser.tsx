import { useEffect } from "react";
import { useLoad } from ".";

export function useCurrentUser(): any {
  const { data, loading, loaded, loadError, fetchData } = useLoad();
  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    fetchData(fetch, "/api/user/self", requestOptions);
  }, []);

  return { data, loading, loaded, loadError };
}
