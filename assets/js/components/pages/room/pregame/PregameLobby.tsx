import React, { useState } from "react";

import {
  SUBMIT_PREGAME_JOIN,
  SUBMIT_LEAVE_ROOM,
  MIN_PLAYER_ALIAS_LENGTH,
  MAX_PLAYER_ALIAS_LENGTH,
} from "../../../../constants";
import {
  FullWidthButton,
  MediumLargeTitle,
  MediumTitle,
  ComputerFrame,
  ComputerButton,
} from "../../../common";
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
  roomName: string;
}

const PregameLobby: React.FC<PregameLobbyProps> = ({
  submitPlayerJoin,
  gameInProgress,
  numPlayersJoined,
  numPlayersToStart,
  currentUser,
  roomName,
}) => {
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  return (
    <div>
      <ComputerFrame>
        <div className="pregame_lobby_page_content">
          <MediumLargeTitle
            centered={false}
          >{`///${roomName}`}</MediumLargeTitle>
          {gameInProgress ? (
            <div>
              <p>
                <strong>Game in progress.</strong> A new game will be starting
                in a few minutes. Feel free to
                <a href="/servers">find another server</a> or play keyboard in
                the meantime.
              </p>
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
                  <p>Game has not started yet. Waiting for more players...</p>
                )}
              </div>
              {hasJoined ? (
                <></>
              ) : (
                <div>
                  <ComputerButton
                    callback={() => {
                      const sentMessage = submitPlayerJoin(
                        SUBMIT_PREGAME_JOIN,
                        {
                          player_alias: currentUser.userAlias,
                          player_id: currentUser.userId,
                        }
                      );
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
                  >
                    <h5>JOIN GAME</h5>
                  </ComputerButton>
                </div>
              )}
              <p>
                <strong>{`${numPlayersJoined}/${numPlayersToStart} Players. Need ${
                  numPlayersToStart - numPlayersJoined
                } more players to start game`}</strong>
              </p>
            </div>
          )}
        </div>
      </ComputerFrame>
      {/* <PregameDebug /> */}
    </div>
  );
};
export { PregameLobby };
