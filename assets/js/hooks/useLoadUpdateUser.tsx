import { useEffect } from "react";
import { useLoad } from ".";
import { UpdateUserPayload } from "../types";

export function useLoadUpdateUser(): any {
  const {
    data,
    loading = false,
    loaded = false,
    loadError = false,
    fetchData,
  } = useLoad();

  const submitRequest = (updateUserBody: UpdateUserPayload) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateUserBody),
    };
    fetchData(fetch, `/api/user`, requestOptions);
  };

  return { submitRequest, data, loading, loaded, loadError };
}
