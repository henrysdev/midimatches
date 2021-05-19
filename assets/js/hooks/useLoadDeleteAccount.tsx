import { useLoad } from ".";
import { DeleteAccountPayload } from "../types";

export function useLoadDeleteAccount(): any {
  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    fetchData,
  } = useLoad();

  const submitRequest = (
    userId: string,
    deleteAccountBody: DeleteAccountPayload
  ) => {
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deleteAccountBody),
    };
    fetchData(fetch, `/api/account/${userId}`, requestOptions);
  };

  return { submitRequest, data, httpStatus, loading, loaded, loadError };
}
