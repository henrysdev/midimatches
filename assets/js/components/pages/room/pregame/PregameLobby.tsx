import React, { useState } from "react";

import { SUBMIT_ENTER_ROOM, SUBMIT_LEAVE_ROOM } from "../../../../constants";
import { FullWidthButton, Title } from "../../../common";
import { PregameDebug } from "../../../debug";

interface PregameLobbyProps {
  pushMessageToChannel: Function;
  gameInProgress: boolean;
  numPlayersJoined: number;
  numPlayersToStart: number;
}

const PregameLobby: React.FC<PregameLobbyProps> = ({
  pushMessageToChannel,
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
      style={
        {
          // maxWidth: "400px",
          // margin: "auto",
          // marginTop: "16px",
          // padding: "24px",
          // boxShadow: "0 5px 15px rgb(0 0 0 / 8%)",
          // color: "#666",
        }
      }
    >
      {/* <Title title="Pregame Lobby" />
      {gameInProgress ? (
        <div>
          Game is full. A new game will be starting in less than TODO minutes.
          In the meantime, feel free to join another server from the serverlist
          TODO.
        </div>
      ) : (
        <div>
          <div>
            {hasJoined ? (
              <p>
                Joined successfully as <strong>{alias}</strong>. Waiting for
                more players...
              </p>
            ) : (
              <p style={{ marginBottom: "8px" }}>
                Game has not started yet. Enter an alias then join!
              </p>
            )}
          </div>
          {hasJoined ? (
            <></>
          ) : (
            <form style={{ margin: 0 }}>
              <fieldset className="uk-fieldset">
                <input
                  style={{ marginBottom: "8px" }}
                  className="uk-input"
                  type="text"
                  placeholder="Enter an alias..."
                  maxLength={20}
                  onChange={handleChange}
                />
              </fieldset>
              <FullWidthButton
                label="Join"
                callback={() => {
                  pushMessageToChannel(SUBMIT_ENTER_ROOM, {
                    player_alias: alias,
                  });
                  setHasJoined(true);
                }}
                disabled={!alias || alias.length < 3}
              />
              {!!alias && alias.length < 3 ? (
                <i style={{ marginLeft: 10, color: "red" }}>
                  Alias must be at least 3 characters long
                </i>
              ) : (
                <></>
              )}
            </form>
          )}
          <div
            style={{ marginTop: "16px" }}
          >{`${numPlayersJoined}/${numPlayersToStart} Players. Need ${
            numPlayersToStart - numPlayersJoined
          } more players to start game`}</div>
        </div>
      )} */}
      <PregameDebug />
    </div>
  );
};
export { PregameLobby };
