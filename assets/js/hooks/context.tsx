import { useContext } from "react";

import { GameContext, ToneAudioContext, PlayerContext } from "../contexts";

import {
  GameContextType,
  ToneAudioContextType,
  PlayerContextType,
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
