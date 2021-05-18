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
  MIN_ROOM_NAME_LENGTH,
  MAX_ROOM_NAME_LENGTH,
} from "../../../constants";
import { min, max } from "lodash";

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
    const targetVal = max([
      min([parseInt(e.target.value.trim()), MAX_ROOM_SIZE]),
      MIN_ROOM_SIZE,
    ]);
    setMaxPlayers(!!targetVal ? targetVal : MAX_ROOM_SIZE);
  };
  const handleNumRoundsChange = (e: any) => {
    const targetVal = max([
      min([parseInt(e.target.value.trim()), MAX_NUM_ROUNDS]),
      MIN_NUM_ROUNDS,
    ]);
    setNumRounds(!!targetVal ? targetVal : MAX_NUM_ROUNDS);
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
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest,
  } = useLoadCreateRoom();

  const [badRequest, setBadRequest] = useState<boolean>(false);

  useEffect(() => {
    if (!!loadError && !!data) {
      setBadRequest(true);
    } else if (!!loaded && !!data && !!data.linkToRoom) {
      window.location.href = data.linkToRoom;
    }
  }, [loaded, loadError, httpStatus]);

  const submitDisabled = useMemo(() => {
    return !trimmedRoomName || trimmedRoomName.length < MIN_ROOM_NAME_LENGTH;
  }, [trimmedRoomName]);

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (!submitDisabled) {
      submitRequest(requestBody);
    }
  };

  return (
    <div className="create_room_wrapper inset_3d_border_shallow inline_screen">
      <MediumTitle centered={false}>CREATE NEW ROOM</MediumTitle>
      {loading ? (
        <div className="relative_anchor">
          <VinylLoadingSpinner />
        </div>
      ) : (
        <form
          className="create_room_form"
          autoComplete="off"
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              handleSubmitForm(e);
            }
          }}
          onSubmit={(e: any) => {
            e.stopPropagation();
            handleSubmitForm(e);
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
              maxLength={MAX_ROOM_NAME_LENGTH}
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
              onChange={handleNumRoundsChange}
            />
            <InlineWidthInputSubmit
              label="CREATE AND JOIN"
              disabled={submitDisabled}
            />
          </fieldset>
          {badRequest ? (
            <div className="warning_alert roboto_font">
              Room creation failed: {`${httpStatus} ${JSON.stringify(data)}`}
            </div>
          ) : (
            <></>
          )}
        </form>
      )}
    </div>
  );
};
export { CreateRoomForm };
