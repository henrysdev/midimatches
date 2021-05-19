import { useLoad } from ".";
import { UpdatePasswordPayload } from "../types";

export function useLoadAccountRecovery(): any {
  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    fetchData,
  } = useLoad();

  const submitRequest = (updatePasswordBody: UpdatePasswordPayload) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePasswordBody),
    };
    fetchData(fetch, `/api/account/recovery`, requestOptions);
  };

  return { submitRequest, data, httpStatus, loading, loaded, loadError };
}
