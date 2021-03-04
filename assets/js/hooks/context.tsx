import { useContext } from "react";

import {
  GameContext,
  ToneAudioContext,
  PlayerContext,
  CurrentUserContext,
  SocketContext,
  ChatContext,
} from "../contexts";

import {
  GameContextType,
  ToneAudioContextType,
  PlayerContextType,
  CurrentUserContextType,
  SocketContextType,
  ChatContextType,
} from "../types";

export function useGameContext() {
  return useContext(GameContext) as GameContextType;
}

export function useToneAudioContext() {
  return useContext(ToneAudioContext) as ToneAudioContextType;
}

export function usePlayerContext() {
  return useContext(PlayerContext) as PlayerContextType;
}

export function useCurrentUserContext() {
  return useContext(CurrentUserContext) as CurrentUserContextType;
}

export function useSocketContext() {
  return useContext(SocketContext) as SocketContextType;
}

export function useChatContext() {
  return useContext(ChatContext) as ChatContextType;
}
