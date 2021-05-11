import { useEffect } from "react";
import { useLoad } from ".";
import { CreateRoomPayload } from "../types";

export function useLoadCreateRoom(): any {
  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    fetchData,
  } = useLoad();

  const submitRequest = (createRoomBody: CreateRoomPayload) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createRoomBody),
    };
    fetchData(fetch, `/api/room`, requestOptions);
  };

  return { submitRequest, data, httpStatus, loading, loaded, loadError };
}
