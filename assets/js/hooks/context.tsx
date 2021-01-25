import { useContext } from "react";

import { GameContext, ToneAudioContext } from "../contexts";

import { GameContextType, ToneAudioContextType } from "../types";

export function useGameContext() {
  return useContext(GameContext) as GameContextType;
}

export function useToneAudioContext() {
  return useContext(ToneAudioContext) as ToneAudioContextType;
}
