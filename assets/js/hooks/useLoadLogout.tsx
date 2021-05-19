import { useLoad } from ".";

export function useLoadLogout(): any {
  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    fetchData,
  } = useLoad();

  const submitRequest = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetchData(fetch, `/api/account/logout`, requestOptions);
  };

  return { submitRequest, data, httpStatus, loading, loaded, loadError };
}
