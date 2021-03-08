import React, { useEffect, useState, useMemo } from "react";

import { useLoad, useLoadCreateRoom } from "../../../hooks";
import {
  MediumTitle,
  InlineWidthInputSubmit,
  VinylLoadingSpinner,
} from "../../common";
import { CreateRoomPayload } from "../../../types";

const CreateRoomForm: React.FC = () => {
  const [roomName, setRoomName] = useState<string>("");
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [numRounds, setNumRounds] = useState<number>(3);

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
              min="3" // TODO have actual min constant
              max="8" // TODO have actual max constant
              id="max_players"
              name="max_players"
              placeholder="4"
              value={maxPlayers}
              maxLength={20}
              onChange={handleMaxPlayersChange}
            />
            <div className="form_input_label roboto_font"># Rounds</div>
            <input
              style={{ marginBottom: "8px" }}
              className="form_number_input roboto_font"
              type="number"
              min="1" // TODO have actual min constant
              max="10" // TODO have actual max constant
              id="num_rounds"
              name="num_rounds"
              placeholder="3"
              value={numRounds}
              maxLength={20}
              onChange={handleNumRoundsChange}
            />
            {loading ? (
              <>LOADING</>
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
