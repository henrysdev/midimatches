import { useEffect } from "react";
import { useLoad } from ".";
import { CreateAccountPayload } from "../types";

export function useLoadCreateAccount(): any {
  const {
    data,
    loading = false,
    loaded = false,
    loadError = false,
    fetchData,
  } = useLoad();

  const submitRequest = (createAccountBody: CreateAccountPayload) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createAccountBody),
    };
    fetchData(fetch, `/api/account/`, requestOptions);
  };

  return { submitRequest, data, loading, loaded, loadError };
}
