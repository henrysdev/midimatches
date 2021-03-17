import React, { useMemo, useRef, useState } from "react";

import {
  MediumLargeTitle,
  ContentButton,
  ComputerButton,
  MediumTitle,
  MaterialIcon,
} from "../../common";
import { RoomState } from "../../../types";
import { CreateRoomForm } from "./CreateRoomForm";

interface ServerlistProps {
  roomStates: RoomState[];
  timeSinceRefresh: number;
}

const enum SortKey {
  ROOM_NAME,
  STATUS,
  NUM_CURR_PLAYERS,
  NUM_ROUNDS,
}

const enum RoomStatus {
  PREGAME,
  IN_GAME,
  FULL,
}

const statusEval = (room: RoomState): RoomStatus => {
  const full = room.numCurrPlayers === room.gameRules.maxPlayers;
  const inGame = room.inGame;

  if (full) {
    return RoomStatus.FULL;
  } else if (inGame) {
    return RoomStatus.IN_GAME;
  } else {
    return RoomStatus.PREGAME;
  }
};

const sortBehaviorsMap = {
  [SortKey.ROOM_NAME]: (a: RoomState, b: RoomState, desc: boolean): number => {
    [a, b] = desc ? [a, b] : [b, a];
    return a.roomName.localeCompare(b.roomName);
  },
  [SortKey.STATUS]: (a: RoomState, b: RoomState, desc: boolean): number => {
    const alphabeticOrder = a.roomName.localeCompare(b.roomName);
    [a, b] = desc ? [a, b] : [b, a];

    const statusA = statusEval(a);
    const statusB = statusEval(b);
    return statusA === statusB ? alphabeticOrder : statusA - statusB;
  },
  [SortKey.NUM_CURR_PLAYERS]: (
    a: RoomState,
    b: RoomState,
    desc: boolean
  ): number => {
    const alphabeticOrder = a.roomName.localeCompare(b.roomName);
    [a, b] = desc ? [a, b] : [b, a];

    const numPlayersA = a.numCurrPlayers;
    const numPlayersB = b.numCurrPlayers;
    return numPlayersA === numPlayersB
      ? alphabeticOrder
      : b.numCurrPlayers - a.numCurrPlayers;
  },
  [SortKey.NUM_ROUNDS]: (a: RoomState, b: RoomState, desc: boolean): number => {
    const alphabeticOrder = a.roomName.localeCompare(b.roomName);
    [a, b] = desc ? [a, b] : [b, a];

    const numRoundsA = a.gameRules.roundsToWin;
    const numRoundsB = b.gameRules.roundsToWin;
    return numRoundsA === numRoundsB
      ? alphabeticOrder
      : numRoundsB - numRoundsA;
  },
};

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

  const [sortKey, setSortKey] = useState<SortKey>(SortKey.NUM_CURR_PLAYERS);
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const toggleSort = (currSortKey: SortKey) => {
    if (currSortKey === sortKey) {
      setSortDesc((prevOrder) => !prevOrder);
    } else {
      setSortDesc(true);
    }
    setSortKey(currSortKey);
  };
  const comparator = useMemo<
    (a: RoomState, b: RoomState, desc: boolean) => number
  >(() => {
    return sortBehaviorsMap[sortKey];
  }, [sortKey, sortDesc]);

  return (
    <div style={{ height: "100%" }}>
      <MediumLargeTitle centered={false}>
        <span className="accent_bars">///</span>ROOM LIST
      </MediumLargeTitle>
      <div className="serverlist_flex_anchor">
        <div className="serverlist_create_room_wrapper ">
          <CreateRoomForm />
        </div>
        <div className="serverlist_table_wrapper inset_3d_border_shallow inline_screen">
          <table className="serverlist_table">
            <thead>
              <tr>
                <th
                  onClick={() => {
                    toggleSort(SortKey.ROOM_NAME);
                  }}
                >
                  Name
                  {sortKey === SortKey.ROOM_NAME ? (
                    sortDesc ? (
                      <MaterialIcon iconName="keyboard_arrow_down" />
                    ) : (
                      <MaterialIcon iconName="keyboard_arrow_up" />
                    )
                  ) : (
                    <></>
                  )}
                </th>
                <th
                  onClick={() => {
                    toggleSort(SortKey.STATUS);
                  }}
                >
                  Status
                  {sortKey === SortKey.STATUS ? (
                    sortDesc ? (
                      <MaterialIcon iconName="keyboard_arrow_down" />
                    ) : (
                      <MaterialIcon iconName="keyboard_arrow_up" />
                    )
                  ) : (
                    <></>
                  )}
                </th>
                <th
                  onClick={() => {
                    toggleSort(SortKey.NUM_CURR_PLAYERS);
                  }}
                >
                  Players
                  {sortKey === SortKey.NUM_CURR_PLAYERS ? (
                    sortDesc ? (
                      <MaterialIcon iconName="keyboard_arrow_down" />
                    ) : (
                      <MaterialIcon iconName="keyboard_arrow_up" />
                    )
                  ) : (
                    <></>
                  )}
                </th>
                <th
                  onClick={() => {
                    toggleSort(SortKey.NUM_ROUNDS);
                  }}
                >
                  # Rounds
                  {sortKey === SortKey.NUM_ROUNDS ? (
                    sortDesc ? (
                      <MaterialIcon iconName="keyboard_arrow_down" />
                    ) : (
                      <MaterialIcon iconName="keyboard_arrow_up" />
                    )
                  ) : (
                    <></>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {roomStates
                .sort((a, b) => {
                  const resp = comparator(a, b, sortDesc);
                  return resp;
                })
                .map((room) => {
                  const status = statusEval(room);
                  return (
                    <tr
                      key={room.roomId}
                      onClick={() => setSelectedRoom(room)}
                      className={
                        !!selectedRoom && selectedRoom.roomId === room.roomId
                          ? "item_selected"
                          : ""
                      }
                    >
                      <td>{room.roomName}</td>
                      <td>
                        {status === RoomStatus.FULL ? (
                          <div style={{ color: "red" }}>Full</div>
                        ) : status === RoomStatus.IN_GAME ? (
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
                <h4>ROOM DETAILS</h4>
                <div className="server_details_content_body">
                  <ul className="roboto_font">
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
              CONNECT
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
