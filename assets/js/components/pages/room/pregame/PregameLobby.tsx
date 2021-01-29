import React, { useState } from "react";

import { SUBMIT_ENTER_ROOM, SUBMIT_LEAVE_ROOM } from "../../../../constants";
import { SimpleButton, Title } from "../../../common";
import { PregameDebug } from "../../../debug";

interface PregameLobbyProps {
  pushMessageToChannel: Function;
}

const PregameLobby: React.FC<PregameLobbyProps> = ({
  pushMessageToChannel,
}) => {
  window.addEventListener("beforeunload", () =>
    pushMessageToChannel(SUBMIT_LEAVE_ROOM, {})
  );

  const [alias, setAlias] = useState<string>();

  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const handleChange = (e: any) => {
    setAlias(e.target.value.trim());
  };

  return (
    <div>
      <Title title="Pregame Lobby" />
      <div>
        {hasJoined
          ? `Joined successfully as ${alias}. Waiting for other players...`
          : "Game has not started yet. Enter an alias then join!"}
      </div>
      <br />
      {hasJoined ? (
        <div>TODO list of other players</div>
      ) : (
        <form>
          <fieldset className="uk-fieldset">
            <div className="uk-margin">
              <input
                className="uk-input"
                type="text"
                placeholder="Enter an alias..."
                maxLength={20}
                onChange={handleChange}
              />
            </div>
          </fieldset>
          <SimpleButton
            label="Join Room"
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
      {/* <PregameDebug /> */}
    </div>
  );
};
export { PregameLobby };
