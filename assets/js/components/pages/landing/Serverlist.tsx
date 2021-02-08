import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import {
  PlayerJoinPayload,
  Player,
  GameContextType,
  StartGamePayload,
  LobbyUpdatePayload,
  ServerlistUpdatePayload,
  RoomState,
} from "../../../types";
import { PlayerContext } from "../../../contexts";
import {
  START_GAME_EVENT,
  LOBBY_UPDATE_EVENT,
  RESET_ROOM_EVENT,
  SUBMIT_LEAVE_ROOM,
  SERVERLIST_UPDATE_EVENT,
} from "../../../constants";
import { Title } from "../../common";

interface ServerlistProps {
  roomStates: RoomState[];
}

const Serverlist: React.FC<ServerlistProps> = ({ roomStates }) => {
  return (
    <div style={{ paddingBottom: "8px" }}>
      <Title title={"Join a game room"} />
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
            <th>Max Players</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {roomStates
            .sort((a, b) => {
              return (
                a.gameRules.gameSizeNumPlayers -
                a.numCurrPlayers -
                (b.gameRules.gameSizeNumPlayers - b.numCurrPlayers)
              );
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
                    <a href={`/room/${room.roomId}`}>Join</a>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
export { Serverlist };
