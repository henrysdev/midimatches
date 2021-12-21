import { useState, useEffect, useMemo } from "react";
import { ToneAudioBuffer } from "tone";

type AudioBufferCacheTuple = [AudioBufferCache, (urls: string[]) => void];

type AudioBufferCache = Map<string, ToneAudioBuffer>;

export function useAudioBufferCache(): AudioBufferCacheTuple {
  const [bufferCache, setBufferCache] = useState<AudioBufferCache>(
    new Map<string, ToneAudioBuffer>()
  );

  const populateBufferCache = async (urls: string[]) => {
    await Promise.all(
      urls.map(async (url) => {
        if (!bufferCache.has(url)) {
          const newBuf = new ToneAudioBuffer();
          await newBuf.load(url);
          setBufferCache((oldCache) => {
            return oldCache.set(url, newBuf);
          });
        }
      })
    );
  };

  return [bufferCache, populateBufferCache];
}
