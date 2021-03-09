import React, { useEffect, useState, useMemo } from "react";

import { useLoad, useLoadCreateRoom } from "../../../hooks";
import {
  MediumTitle,
  InlineWidthInputSubmit,
  VinylLoadingSpinner,
} from "../../common";
import { CreateRoomPayload } from "../../../types";
import {
  MIN_ROOM_SIZE,
  MAX_ROOM_SIZE,
  DEFAULT_ROOM_SIZE,
  MIN_NUM_ROUNDS,
  MAX_NUM_ROUNDS,
  DEFAULT_NUM_ROUNDS,
} from "../../../constants";

const CreateRoomForm: React.FC = () => {
  const [roomName, setRoomName] = useState<string>("");
  const [maxPlayers, setMaxPlayers] = useState<number>(DEFAULT_ROOM_SIZE);
  const [numRounds, setNumRounds] = useState<number>(DEFAULT_NUM_ROUNDS);

  const handleRoomNameChange = (e: any) => {
    setRoomName(e.target.value);
  };
  const trimmedRoomName = useMemo(() => {
    return roomName.trim();
  }, [roomName]);

  const handleMaxPlayersChange = (e: any) => {
    const targetVal = e.target.value.trim();
    setMaxPlayers(parseInt(targetVal));
  };
  const handleNumRoundsChange = (e: any) => {
    const targetVal = e.target.value.trim();
    setNumRounds(parseInt(targetVal));
  };
  const requestBody = useMemo((): CreateRoomPayload => {
    return {
      room_name: trimmedRoomName,
      max_players: maxPlayers,
      num_rounds: numRounds,
    };
  }, [trimmedRoomName, maxPlayers, numRounds]);

  const {
    data,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest,
  } = useLoadCreateRoom();

  useEffect(() => {
    if (!!loaded && !!data && !!data.linkToRoom) {
      window.location.href = data.linkToRoom;
    }
  }, [loaded]);

  return (
    <div className="create_room_wrapper inset_3d_border_shallow inline_screen">
      <MediumTitle centered={false}>NEW ROOM</MediumTitle>
      {loading || loaded ? (
        <div className="relative_anchor">
          <VinylLoadingSpinner />
        </div>
      ) : loadError ? (
        <div>FAILED</div>
      ) : (
        <form
          className="create_room_form"
          autoComplete="off"
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitRequest(requestBody);
            }
          }}
          onSubmit={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            submitRequest(requestBody);
          }}
        >
          <fieldset>
            <input
              style={{ marginBottom: "8px" }}
              className="inline_width_text_input roboto_font"
              type="text"
              id="room_name"
              name="room_name"
              placeholder="Enter room name..."
              value={roomName}
              maxLength={20}
              onChange={handleRoomNameChange}
            />
            <div className="form_input_label roboto_font">Max Players </div>
            <input
              style={{ marginBottom: "8px" }}
              className="form_number_input roboto_font"
              type="number"
              min={`${MIN_ROOM_SIZE}`}
              max={`${MAX_ROOM_SIZE}`}
              id="max_players"
              name="max_players"
              placeholder={`${DEFAULT_ROOM_SIZE}`}
              value={maxPlayers}
              maxLength={20}
              onChange={handleMaxPlayersChange}
            />
            <div className="form_input_label roboto_font"># Rounds</div>
            <input
              style={{ marginBottom: "8px" }}
              className="form_number_input roboto_font"
              type="number"
              min={`${MIN_NUM_ROUNDS}`}
              max={`${MAX_NUM_ROUNDS}`}
              id="num_rounds"
              name="num_rounds"
              placeholder={`${DEFAULT_NUM_ROUNDS}`}
              value={numRounds}
              maxLength={20}
              onChange={handleNumRoundsChange}
            />
            {loading ? (
              <div className="relative_anchor">
                <VinylLoadingSpinner />
              </div>
            ) : (
              <InlineWidthInputSubmit
                label="CREATE AND JOIN"
                disabled={!trimmedRoomName || trimmedRoomName.length < 3}
              />
            )}
          </fieldset>
        </form>
      )}
    </div>
  );
};
export { CreateRoomForm };
