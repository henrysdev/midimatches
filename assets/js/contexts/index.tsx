import { createContext } from "react";

export const GameContext = createContext({});
export const ToneAudioContext = createContext({});
export const PlayerContext = createContext({});
export const CurrentUserContext = createContext({});
export const SocketContext = createContext({});
export const ChatContext = createContext({});
export const KeyboardInputContext = createContext({});
export const ClockOffsetContext = createContext({});

// Game Sub-contexts
export const GameViewContext = createContext({});
export const PlayersContext = createContext({});
export const ViewDeadlineContext = createContext({});
export const GameRulesContext = createContext({});
export const ScoresContext = createContext({});
export const RoundRecordingStartTimeContext = createContext({});
