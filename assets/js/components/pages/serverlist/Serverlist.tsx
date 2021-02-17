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
          <table className="serverlist_table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Players</th>
                <th># Rounds</th>
              </tr>
            </thead>
            <tbody>
              {roomStates
                .sort((a, b) => {
                  return b.numCurrPlayers - a.numCurrPlayers;
                })
                .map((room) => {
                  return (
                    <tr key={room.roomId} onClick={() => setSelectedRoom(room)}>
                      <td>{room.roomName}</td>
                      <td>
                        {room.inGame ? (
                          <div style={{ color: "red" }}>In Game</div>
                        ) : (
                          <div style={{ color: "#1aeb13" }}>Pregame</div>
                        )}
                      </td>
                      <td>{`${room.numCurrPlayers} / ${room.gameRules.gameSizeNumPlayers}`}</td>
                      <td>{room.gameRules.roundsToWin}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {!!selectedRoom ? (
          <div className="serverlist_details_pane_wrapper">
            <div className="serverlist_details_pane inset_3d_border_shallow">
              <div className="server_details_content_wrapper">
                <h5>{selectedRoom.roomName}</h5>
                <div className="server_details_content_body">
                  <ul>
                    <div>
                      <strong>Game Mode: </strong>
                      Classic
                    </div>
                    <div>
                      <strong>Player Requirements: </strong>
                      None
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
