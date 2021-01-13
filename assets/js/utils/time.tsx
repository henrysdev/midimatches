import { Milliseconds, Seconds } from "../types";

export function secToMs(time: Seconds): Milliseconds {
  return time * 1000;
}
export function msToSec(time: Milliseconds): Seconds {
  return time * 0.001;
}
