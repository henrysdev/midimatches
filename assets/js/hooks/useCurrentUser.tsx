import { useEffect, useState } from "react";
import { Channel, Push } from "phoenix";

import { GAME_VIEW, GAME_UPDATE_EVENT } from "../constants";
import { GameContextType, GameUpdatePayload } from "../types";
import { gameViewAtomToEnum, unmarshalBody } from "../utils";
import { useLoad } from ".";

export function useCurrentUser(): any {
  const { data, loading, loaded, loadError, fetchData } = useLoad();
  useEffect(() => {
    // POST request using fetch inside useEffect React hook
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    fetchData(fetch, "/api/user/self", requestOptions);
  }, []);

  return { data, loading, loaded, loadError };
}
