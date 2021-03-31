import React, { useState, useRef, useEffect } from "react";

import {
  MediumLargeTitle,
  MediumTitle,
  ComputerFrame,
  ComputerButton,
  Timer,
  ChatBox,
  MaterialIcon,
} from "../../../common";
import { PregameDebug } from "../../../debug";
import { PregameCenterPane, WarmUp } from ".";
import { User, Player } from "../../../../types";
import { currUtcTimestamp } from "../../../../utils";
import { useClockOffsetContext, usePlayerContext } from "../../../../hooks";

interface PregameLobbyProps {
  gameInProgress: boolean;
  numPlayersToStart: number;
  roomPlayers: Player[];
  maxPlayers: number;
  currentUser: User;
  roomName: string;
  startGameDeadline: number;
}

const PregameLobby: React.FC<PregameLobbyProps> = ({
  gameInProgress,
  numPlayersToStart,
  roomPlayers = [],
  maxPlayers,
  currentUser,
  roomName,
  startGameDeadline,
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const { clockOffset } = useClockOffsetContext();
  const { isAudienceMember } = usePlayerContext();

  return (
    <div>
      <ComputerFrame>
        <div className="pregame_lobby_page_content">
          <div style={{ display: "flex" }}>
            <div style={{ flex: 6, float: "left" }}>
              <MediumLargeTitle centered={false}>
                <span className="accent_bars">///</span>PREGAME LOBBY
              </MediumLargeTitle>
              <MediumTitle centered={false}>{roomName}</MediumTitle>
            </div>
            <div style={{ flex: 1, float: "right", textAlign: "right" }}>
              <h2
                className={
                  isAudienceMember
                    ? "audience_member_role_text"
                    : "player_role_text"
                }
              >
                <strong>{isAudienceMember ? "[AUDIENCE]" : ""}</strong>
              </h2>
            </div>
          </div>
          <div className="pregame_lobby_flex_anchor">
            <div className="pregame_content_pane">
              <div className="inline_screen inset_3d_border_shallow rounded_border">
                <p>
                  {!!maxPlayers && !!roomPlayers
                    ? `${roomPlayers.length}/${maxPlayers} Players.`
                    : ""}
                  {numPlayersToStart - roomPlayers.length > 0 ? (
                    <strong>
                      {` Need at least ${
                        numPlayersToStart - roomPlayers.length
                      } more Player(s) to start game`}
                    </strong>
                  ) : (
                    <></>
                  )}
                </p>
              </div>

              {/* <ChatBox players={roomPlayers} /> */}
            </div>
            <PregameCenterPane
              gameInProgress={gameInProgress}
              currentUser={currentUser}
            />
          </div>
          <div style={{ height: "48px", margin: "8px", padding: "8px" }}>
            <ComputerButton
              callback={() => {
                navigator.clipboard.writeText(location.href);
                setCopySuccess(true);
              }}
            >
              COPY INVITE
              {copySuccess ? (
                <MaterialIcon
                  iconName="done"
                  style={{
                    color: "green",
                    marginLeft: "4px",
                    marginBottom: "4px",
                  }}
                />
              ) : (
                <MaterialIcon
                  iconName="content_copy"
                  style={{
                    color: "var(--text_light)",
                    verticalAlign: "middle",
                    marginLeft: "4px",
                    marginBottom: "4px",
                  }}
                />
              )}
            </ComputerButton>
          </div>
        </div>
        {!!startGameDeadline && startGameDeadline > -1 ? (
          <div style={{ marginTop: "16px" }}>
            <Timer
              descriptionText={"Intermission - Next game in "}
              duration={startGameDeadline - currUtcTimestamp() + clockOffset}
              timesUpText={
                "Game will start as soon as there are enough players"
              }
            />
          </div>
        ) : (
          <></>
        )}
      </ComputerFrame>
      {/* <PregameDebug /> */}
    </div>
  );
};
export { PregameLobby };
