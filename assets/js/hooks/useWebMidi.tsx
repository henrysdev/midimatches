import { useEffect, useState } from "react";
import WebMidi, { Input } from "webmidi";

type WebMidiTuple = [Input[], () => void];

export function useWebMidi(): WebMidiTuple {
  const [midiInputs, setMidiInputs] = useState<Input[]>([]);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  const refreshMidiInputs = () => setRefreshCounter((prev) => prev + 1);

  useEffect(() => {
    WebMidi.enable((error) => {
      if (error) {
        console.warn("WebMidi could not be enabled.");
        return;
      } else {
        setMidiInputs(WebMidi.inputs);
      }
      console.log("WebMidi enabled.");
      if (WebMidi.inputs.length === 0) {
        console.log("No MIDI inputs.");
        return;
      }
    });

    return () => {
      WebMidi.disable();
    };
  }, [refreshCounter]);

  return [midiInputs, refreshMidiInputs];
}
