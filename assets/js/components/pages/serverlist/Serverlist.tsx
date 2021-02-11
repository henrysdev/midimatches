import React, { useMemo, useRef, useState } from "react";

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

  return (
    <div style={{ padding: "8px" }}>
      <h1 className="uk-text-center">Room List</h1>
      <p>
        Look for rooms that have the "Pregame" status to get into a lobby
        without having to wait for the current game to end. Rooms with the most
        players in them will appear closer to the top.
      </p>
      <table
        className="uk-table uk-table-divider uk-background-muted"
        style={{
          marginTop: 0,
          marginBottom: 0,
          overflow: "scroll",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th># Players</th>
            <th>Required Players</th>
            <th>Join</th>
            {/* <th>Link</th> */}
          </tr>
        </thead>
        <tbody>
          {roomStates
            .sort((a, b) => {
              return b.numCurrPlayers - a.numCurrPlayers;
            })
            .map((room) => {
              return (
                <tr key={room.roomId}>
                  <td>{room.roomName}</td>
                  <td>
                    {room.inGame ? (
                      <div style={{ color: "red" }}>In Game</div>
                    ) : (
                      <div style={{ color: "green" }}>Pregame</div>
                    )}
                  </td>
                  <td>{room.numCurrPlayers}</td>
                  <td>{room.gameRules.gameSizeNumPlayers}</td>
                  <td>
                    <button
                      style={{ width: "100%", cursor: "pointer" }}
                      onClick={() =>
                        (window.location.href = `/room/${room.roomId}`)
                      }
                    >
                      JOIN
                    </button>
                  </td>
                  <td>
                    {/* <div>
                      <i
                        style={{
                          verticalAlign: "middle",
                          color: "gray",
                          cursor: "pointer",
                        }}
                        onClick={copyToClipboard}
                        className="material-icons"
                      >
                        content_copy
                      </i>
                    </div> */}

                    {/* <a href={`/room/${room.roomId}`}>Join</a> */}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div style={{ paddingTop: "8px", paddingBottom: "8px" }}>
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
