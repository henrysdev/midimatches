import React, { useState } from "react";

import {
  SUBMIT_PREGAME_JOIN,
  SUBMIT_LEAVE_ROOM,
  MIN_PLAYER_ALIAS_LENGTH,
  MAX_PLAYER_ALIAS_LENGTH,
} from "../../../../constants";
import { FullWidthButton, MediumLargeTitle } from "../../../common";
import { RecordMidi } from "../../../audio";
import { PregameDebug } from "../../../debug";
import { WarmUp } from ".";
import { User } from "../../../../types";

interface PregameLobbyProps {
  submitPlayerJoin: Function;
  gameInProgress: boolean;
  numPlayersJoined: number;
  numPlayersToStart: number;
  currentUser: User;
}

const PregameLobby: React.FC<PregameLobbyProps> = ({
  submitPlayerJoin,
  gameInProgress,
  numPlayersJoined,
  numPlayersToStart,
  currentUser,
}) => {
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  return (
    <div>
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
        <MediumLargeTitle title="Pregame Lobby" />
        {gameInProgress ? (
          <div>
            <div>
              <strong>Game in progress.</strong> A new game will be starting in
              a few minutes. Feel free to <a href="/">find another server</a> or
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
                    Joined successfully as{" "}
                    <strong>{currentUser.userAlias}</strong>. Warm up your
                    fingers a bit! Waiting for more players...
                  </p>
                  <WarmUp />
                </div>
              ) : (
                <p style={{ marginBottom: "8px" }}>Game has not started yet.</p>
              )}
            </div>
            {hasJoined ? (
              <></>
            ) : (
              <div>
                <FullWidthButton
                  label="Join"
                  callback={() => {
                    const sentMessage = submitPlayerJoin(SUBMIT_PREGAME_JOIN, {
                      player_alias: currentUser.userAlias,
                      player_id: currentUser.userId,
                    });
                    if (!!sentMessage) {
                      sentMessage
                        .receive("ok", (_reply: any) => {
                          console.log("join game successful");
                          setHasJoined(true);
                        })
                        .receive("error", (err: any) => {
                          console.error("join game error: ", err);
                        });
                    }
                  }}
                />
              </div>
            )}
            <div style={{ marginTop: "16px" }}>
              <strong>{`${numPlayersJoined}/${numPlayersToStart} Players. Need ${
                numPlayersToStart - numPlayersJoined
              } more players to start game`}</strong>
            </div>
          </div>
        )}
      </div>
      {/* <PregameDebug /> */}
    </div>
  );
};
export { PregameLobby };
