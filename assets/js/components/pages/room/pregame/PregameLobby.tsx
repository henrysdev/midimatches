import React, { useState, useRef, useEffect } from "react";

import {
  MediumLargeTitle,
  MediumTitle,
  ComputerFrame,
  ComputerButton,
  Timer,
} from "../../../common";
import { PregameDebug } from "../../../debug";
import { PregameCenterPane, WarmUp } from ".";
import { User } from "../../../../types";
import { ChatBox } from "../game";

interface PregameLobbyProps {
  gameInProgress: boolean;
  numPlayersJoined: number;
  numPlayersToStart: number;
  maxPlayers: number;
  currentUser: User;
  roomName: string;
  startGameDeadline: number;
}

const PregameLobby: React.FC<PregameLobbyProps> = ({
  gameInProgress,
  numPlayersJoined,
  numPlayersToStart,
  maxPlayers,
  currentUser,
  roomName,
  startGameDeadline,
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  return (
    <div>
      <ComputerFrame>
        <div className="pregame_lobby_page_content">
          <MediumLargeTitle centered={false}>///PREGAME LOBBY</MediumLargeTitle>
          <MediumTitle centered={false}>{roomName}</MediumTitle>
          <div className="pregame_lobby_flex_anchor">
            <div className="pregame_content_pane">
              <div className="inline_screen inset_3d_border_shallow rounded_border">
                <p>
                  {`${numPlayersJoined}/${maxPlayers} Players.`}
                  {numPlayersToStart - numPlayersJoined > 0 ? (
                    <strong>
                      {` Need at least ${
                        numPlayersToStart - numPlayersJoined
                      } more players to start game`}
                    </strong>
                  ) : (
                    <></>
                  )}
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
              <ChatBox />
            </div>
            <PregameCenterPane
              gameInProgress={gameInProgress}
              currentUser={currentUser}
            />
          </div>
        </div>
        {!!startGameDeadline && startGameDeadline > -1 ? (
          <Timer
            descriptionText={"Intermission - Next game in "}
            duration={startGameDeadline - Date.now()}
            timesUpText={"Game will start as soon as there are enough players"}
          />
        ) : (
          <></>
        )}
      </ComputerFrame>
      {/* <PregameDebug /> */}
    </div>
  );
};
export { PregameLobby };
