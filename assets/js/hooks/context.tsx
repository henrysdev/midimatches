import { useContext } from "react";

import {
  GameContext,
  ToneAudioContext,
  PlayerContext,
  CurrentUserContext,
  SocketContext,
  ChatContext,
  GameViewContext,
  PlayersContext,
  ViewDeadlineContext,
  GameRulesContext,
  ScoresContext,
  KeyboardInputContext,
  RoundRecordingStartTimeContext,
  ClockOffsetContext,
  BrowserCompatibilityContext,
  BackingTrackContext,
} from "../contexts";

import {
  GameContextType,
  ToneAudioContextType,
  PlayerContextType,
  CurrentUserContextType,
  SocketContextType,
  ChatContextType,
  GameViewContextType,
  PlayersContextType,
  ViewDeadlineContextType,
  GameRulesContextType,
  ScoresContextType,
  KeyboardInputContextType,
  RoundRecordingStartTimeContextType,
  ClockOffsetContextType,
  BrowserCompatibilityContextType,
  BackingTrackContextType,
} from "../types";
import { Player } from "tone";

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

export function useGameViewContext() {
  return useContext(GameViewContext) as GameViewContextType;
}

export function usePlayersContext() {
  return useContext(PlayersContext) as PlayersContextType;
}

export function useViewDeadlineContext() {
  return useContext(ViewDeadlineContext) as ViewDeadlineContextType;
}

export function useGameRulesContext() {
  return useContext(GameRulesContext) as GameRulesContextType;
}

export function useScoresContext() {
  return useContext(ScoresContext) as ScoresContextType;
}

export function useRoundRecordingStartTimeContext() {
  return useContext(
    RoundRecordingStartTimeContext
  ) as RoundRecordingStartTimeContextType;
}

export function useKeyboardInputContext() {
  return useContext(KeyboardInputContext) as KeyboardInputContextType;
}

export function useClockOffsetContext() {
  return useContext(ClockOffsetContext) as ClockOffsetContextType;
}

export function useBrowserCompatibilityContext() {
  return useContext(
    BrowserCompatibilityContext
  ) as BrowserCompatibilityContextType;
}

export function useBackingTrackContext() {
  return useContext(BackingTrackContext) as BackingTrackContextType;
}
