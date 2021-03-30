import { useEffect, useState } from "react";
import { useSyncUser } from ".";
import { currUtcTimestamp, unmarshalBody } from "../utils";
import { Milliseconds } from "../types";
import { CLOCK_OUT_OF_SYNC_THRESHOLD } from "../constants";

export function useCalcClockOffset(): any {
  const { data: data1, loaded: loaded1 } = useSyncUser();
  const { data: data2, loaded: loaded2 } = useSyncUser();
  const { data: data3, loaded: loaded3 } = useSyncUser();
  const [clockOffset, setClockOffset] = useState<Milliseconds>(0);

  useEffect(() => {
    if (!!loaded1 && !!loaded2 && !!loaded3) {
      const offset1 = ntpOffset(data1);
      const offset2 = ntpOffset(data2);
      const offset3 = ntpOffset(data3);
      const avgOffset = Math.floor((offset1 + offset2 + offset3) / 3);

      // only do offset adjustment for outliers
      const clockOffsetMs =
        Math.abs(avgOffset) > CLOCK_OUT_OF_SYNC_THRESHOLD ? avgOffset : 0;

      console.log("local clock offset ", clockOffsetMs);
      setClockOffset(clockOffsetMs);
    }
  }, [loaded1, loaded2, loaded3]);

  return clockOffset;
}

const ntpOffset = (data: any): Milliseconds => {
  const { firstHopDeltaTime, serverTime } = unmarshalBody(data) as any;
  const clientEndTime = currUtcTimestamp();
  const approxOffset = Math.floor(
    -1 * ((firstHopDeltaTime + (serverTime - clientEndTime)) / 2)
  );

  return approxOffset;
};
