import React, { useMemo, useRef, useState } from "react";

import { MediumLargeTitle, ContentButton, ComputerButton } from "../../common";
import { RoomState } from "../../../types";

interface ServerlistProps {
  roomStates: RoomState[];
  timeSinceRefresh: number;
}

const Serverlist: React.FC<ServerlistProps> = ({
  roomStates,
  timeSinceRefresh,
}) => {
  const numPlayersOnline = useMemo(() => {
    return roomStates.reduce((acc: number, room: RoomState) => {
      return acc + room.numCurrPlayers;
    }, 0);
  }, [timeSinceRefresh]);

  const [selectedRoom, setSelectedRoom] = useState<RoomState>();

  return (
    <div>
      <MediumLargeTitle centered={false}>///ROOM LIST</MediumLargeTitle>
      <div className="serverlist_flex_anchor">
        <div className="serverlist_table_wrapper inset_3d_border_shallow">
          <table className="serverlist_table inline_screen">
            <thead>
              <tr>
                <th>NAME</th>
                <th>STATUS</th>
                <th>PLAYERS</th>
                <th># ROUNDS</th>
              </tr>
            </thead>
            <tbody>
              {roomStates
                .sort((a, b) => {
                  return b.numCurrPlayers - a.numCurrPlayers;
                })
                .map((room) => {
                  return (
                    <tr
                      key={room.roomId}
                      onClick={() => setSelectedRoom(room)}
                      className={
                        !!selectedRoom && selectedRoom.roomId === room.roomId
                          ? "selected_highlight_color"
                          : ""
                      }
                    >
                      <td>{room.roomName}</td>
                      <td>
                        {room.numCurrPlayers === room.gameRules.maxPlayers ? (
                          <div style={{ color: "red" }}>Full</div>
                        ) : room.inGame ? (
                          <div style={{ color: "blue" }}>In Game</div>
                        ) : (
                          <div style={{ color: "#1aeb13" }}>Pregame</div>
                        )}
                      </td>
                      <td>{`${room.numCurrPlayers} / ${room.gameRules.maxPlayers}`}</td>
                      <td>{room.gameRules.roundsToWin}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {!!selectedRoom ? (
          <div className="serverlist_details_pane_wrapper">
            <div className="serverlist_details_pane inline_screen inset_3d_border_shallow">
              <div className="server_details_content_wrapper">
                <h5>ROOM DETAILS</h5>
                <div className="server_details_content_body">
                  <ul>
                    <div>
                      <strong>Room Name: </strong>
                      {selectedRoom.roomName}
                    </div>
                    <div>
                      <strong>Game: </strong>
                      Free-for-all
                    </div>
                    <div>
                      <strong>Min Players: </strong>
                      {selectedRoom.gameRules.minPlayers}
                    </div>
                    <div>
                      <strong>Max Players: </strong>
                      {selectedRoom.gameRules.maxPlayers}
                    </div>
                  </ul>
                </div>
              </div>
            </div>
            <ComputerButton
              callback={() =>
                (window.location.href = `/room/${selectedRoom.roomId}`)
              }
              extraClasses={["server_details_connect_button"]}
            >
              <h5>CONNECT</h5>
            </ComputerButton>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div style={{ paddingBottom: "16px" }}>
        <div style={{ float: "left" }}>
          <p>{numPlayersOnline} players online</p>
        </div>
        <div style={{ float: "right" }}>
          <p>last updated {timeSinceRefresh}ms ago.</p>
        </div>
      </div>
    </div>
  );
};
export { Serverlist };
