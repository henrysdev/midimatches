import React, { useEffect, useState, useMemo } from "react";

import { useLoad, useLoadCreateRoom } from "../../../hooks";
import { MediumTitle } from "../../common";
import { CreateRoomPayload } from "../../../types";

const CreateRoomForm: React.FC = () => {
  const [roomName, setRoomName] = useState<string>("");
  const [maxPlayers, setMaxPlayers] = useState<number>(3);
  const [numRounds, setNumRounds] = useState<number>(3);

  const handleRoomNameChange = (e: any) => {
    setRoomName(e.target.value.trim());
  };
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
      room_name: roomName,
      max_players: maxPlayers,
      num_rounds: numRounds,
    };
  }, [roomName, maxPlayers, numRounds]);

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
      <MediumTitle centered={false}>CREATE ROOM</MediumTitle>
      {loading || loaded ? (
        <div>LOADING SPINNER HERE</div>
      ) : loadError ? (
        <div>FAILED</div>
      ) : (
        <form
          className="create_room_form"
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
            <div className="form_input_label roboto_font">Room Name </div>
            <input
              style={{ marginBottom: "8px" }}
              className="form_text_input roboto_font"
              type="text"
              id="room_name"
              name="room_name"
              placeholder="Enter a room name..."
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
              placeholder="3"
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
              <input
                className="register_player_submit_button roboto_font"
                disabled={!roomName || roomName.length < 3}
                type="submit"
                value="CREATE AND JOIN"
              />
            )}
          </fieldset>
        </form>
      )}
    </div>
  );
};
export { CreateRoomForm };
