import { useEffect } from "react";
import { useLoad } from ".";

export function useLoadRandomSamples(
  watchers: Array<any> = [],
  count = 1
): any {
  const { data, loading, loaded, loadError, fetchData } = useLoad();
  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    fetchData(fetch, `/api/samples/random?count=${count}`, requestOptions);
  }, [...watchers]);

  return { data, loading, loaded, loadError };
}
