import React, { useState } from "react";

import {
  SUBMIT_ENTER_ROOM,
  SUBMIT_LEAVE_ROOM,
  MIN_PLAYER_ALIAS_LENGTH,
  MAX_PLAYER_ALIAS_LENGTH,
} from "../../../../constants";
import { FullWidthButton, Title } from "../../../common";
import { RecordMidi } from "../../../audio";
import { PregameDebug } from "../../../debug";
import { WarmUp } from ".";

interface PregameLobbyProps {
  submitPlayerJoin: Function;
  gameInProgress: boolean;
  numPlayersJoined: number;
  numPlayersToStart: number;
}

const PregameLobby: React.FC<PregameLobbyProps> = ({
  submitPlayerJoin,
  gameInProgress,
  numPlayersJoined,
  numPlayersToStart,
}) => {
  const [alias, setAlias] = useState<string>();

  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const handleChange = (e: any) => {
    setAlias(e.target.value.trim());
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "auto",
        marginTop: "16px",
        padding: "24px",
        boxShadow: "0 5px 15px rgb(0 0 0 / 8%)",
        color: "#666",
      }}
    >
      <Title title="Pregame Lobby" />
      {gameInProgress ? (
        <div>
          <div>
            <strong>Game in progress.</strong> A new game will be starting in a
            few minutes. Feel free to <a href="/">find another server</a> or
            play keyboard in the meantime.
          </div>
          <WarmUp />
        </div>
      ) : (
        <div>
          <div>
            {hasJoined ? (
              <div>
                <p>
                  Joined successfully as <strong>{alias}</strong>. Warm up your
                  fingers a bit! Waiting for more players...
                </p>
                <WarmUp />
              </div>
            ) : (
              <p style={{ marginBottom: "8px" }}>Game has not started yet.</p>
            )}
          </div>
          {/* {hasJoined ? (
            <></>
          ) : (
            <form style={{ margin: 0 }}>
              <fieldset className="uk-fieldset">
                <input
                  style={{ marginBottom: "8px" }}
                  className="uk-input"
                  type="text"
                  placeholder="Enter an alias..."
                  maxLength={MAX_PLAYER_ALIAS_LENGTH}
                  onChange={handleChange}
                />
              </fieldset>
              <FullWidthButton
                label="Join"
                callback={() => {
                  submitPlayerJoin(SUBMIT_ENTER_ROOM, {
                    player_alias: alias,
                  });
                  setHasJoined(true);
                }}
                disabled={!alias || alias.length < MIN_PLAYER_ALIAS_LENGTH}
              />
              {!!alias && alias.length < MIN_PLAYER_ALIAS_LENGTH ? (
                <i style={{ marginLeft: 10, color: "red" }}>
                  Alias must be at least 3 characters long
                </i>
              ) : (
                <></>
              )}
            </form>
          )} */}
          <div style={{ marginTop: "16px" }}>
            <strong>{`${numPlayersJoined}/${numPlayersToStart} Players. Need ${
              numPlayersToStart - numPlayersJoined
            } more players to start game`}</strong>
          </div>
        </div>
      )}
      {/* <PregameDebug /> */}
    </div>
  );
};
export { PregameLobby };
