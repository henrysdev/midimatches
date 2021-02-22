import React, { useState, useRef, useEffect } from "react";

import { SUBMIT_PREGAME_JOIN } from "../../../../constants";
import {
  MediumLargeTitle,
  MediumTitle,
  ComputerFrame,
  ComputerButton,
} from "../../../common";
import { PregameDebug } from "../../../debug";
import { PregameCenterPane, WarmUp } from ".";
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
  useEffect(() => {
    const sentMessage = submitPlayerJoin();
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
  }, []);

  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  return (
    <div>
      <ComputerFrame>
        <div className="pregame_lobby_page_content">
          <MediumLargeTitle centered={false}>///PREGAME LOBBY</MediumLargeTitle>
          <MediumTitle centered={false}>{roomName}</MediumTitle>
          {hasJoined || gameInProgress ? (
            <div className="pregame_lobby_flex_anchor">
              <div className="pregame_content_pane">
                <div className="inline_screen inset_3d_border_shallow">
                  <p>
                    <strong>{`${numPlayersJoined}/${numPlayersToStart} Players. Need ${
                      numPlayersToStart - numPlayersJoined
                    } more players to start game`}</strong>
                  </p>
                </div>
                <ComputerButton
                  callback={() => {
                    navigator.clipboard.writeText(location.href);
                    setCopySuccess(true);
                  }}
                >
                  <h5>
                    COPY INVITE
                    {copySuccess ? (
                      <i
                        style={{
                          color: "green",
                          verticalAlign: "middle",
                          marginLeft: "4px",
                          marginBottom: "4px",
                        }}
                        className="material-icons"
                      >
                        done
                      </i>
                    ) : (
                      <i
                        style={{
                          color: "black",
                          verticalAlign: "middle",
                          marginLeft: "4px",
                          marginBottom: "4px",
                        }}
                        className="material-icons"
                      >
                        content_copy
                      </i>
                    )}
                  </h5>
                </ComputerButton>
              </div>
              <PregameCenterPane
                gameInProgress={gameInProgress}
                currentUser={currentUser}
              />
            </div>
          ) : !hasJoined && !gameInProgress ? (
            <div>
              {/* <ComputerButton
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
              >
                <h5>JOIN GAME</h5>
              </ComputerButton> */}
            </div>
          ) : (
            <></>
          )}
        </div>
      </ComputerFrame>
      {/* <PregameDebug /> */}
    </div>
  );
};
export { PregameLobby };
