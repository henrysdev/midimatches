import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { unmarshalBody } from "../../../utils";
import {
  PlayerJoinPayload,
  Player,
  GameContextType,
  StartGamePayload,
  LobbyUpdatePayload,
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
import { Title, FullWidthButton, Instructions } from "../../common";

const HowToPlay: React.FC = () => {
  return (
    <div>
      <Title title="How to Play" />
      TODO
    </div>
  );
};
export { HowToPlay };
