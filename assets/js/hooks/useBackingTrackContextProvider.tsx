import { useMemo } from "react";
import { useCookies } from ".";
import { BackingTrackContextType, BackingTrack } from "../types";
import {
  DEFAULT_SAMPLE_MEASURES,
  DEFAULT_NUM_RECORDED_LOOPS,
  DEFAULT_NUM_WARMUP_LOOPS,
} from "../constants";

export function useBackingTrackContextProvider(
  backingTrack: BackingTrack
): BackingTrackContextType {
  const { sampleLength, recordingTime, warmUpTime } = useMemo(() => {
    const sampleLength = (60 / backingTrack.bpm) * 4 * DEFAULT_SAMPLE_MEASURES;
    const warmUpTime = sampleLength * DEFAULT_NUM_WARMUP_LOOPS;
    const recordingTime = sampleLength * DEFAULT_NUM_RECORDED_LOOPS;

    return {
      sampleLength,
      warmUpTime,
      recordingTime,
    };
  }, [backingTrack]);

  return {
    backingTrack,
    sampleLength,
    warmUpTime,
    recordingTime,
  };
}
