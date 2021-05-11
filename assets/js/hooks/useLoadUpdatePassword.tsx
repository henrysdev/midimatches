import { useLoad } from ".";
import { UpdatePasswordPayload } from "../types";

export function useLoadUpdatePassword(): any {
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
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePasswordBody),
    };
    fetchData(fetch, `/api/account/password`, requestOptions);
  };

  return { submitRequest, data, httpStatus, loading, loaded, loadError };
}
