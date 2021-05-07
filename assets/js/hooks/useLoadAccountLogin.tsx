import { useEffect } from "react";
import { useLoad } from ".";
import { CreateAccountPayload, AccountLoginPayload } from "../types";

export function useLoadAccountLogin(): any {
  const {
    data,
    loading = false,
    loaded = false,
    loadError = false,
    fetchData,
  } = useLoad();

  const submitRequest = (accountLoginBody: AccountLoginPayload) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountLoginBody),
    };
    fetchData(fetch, `/api/account/login`, requestOptions);
  };

  return { submitRequest, data, loading, loaded, loadError };
}
