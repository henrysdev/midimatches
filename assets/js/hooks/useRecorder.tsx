import { useMemo } from "react";

type Recorder = {
  recorder: any;
  startRecorder: () => void;
  stopRecorder: (fileUrl: string) => void;
};

export function useRecorder(Tone: any): Recorder {
  const recorder = useMemo(() => {
    const newRecorder = new Tone.Recorder({ mimeType: "audio/webm" });
    return newRecorder;
  }, []);

  const startRecorder = () => {
    console.log("start recorder");
    recorder.start();
  };

  const stopRecorder = async (fileUrl: string) => {
    console.log("stop recorder");
    // the recorded audio is returned as a blob
    const recording = await recorder.stop();
    // download the recording by creating an anchor element and blob url
    const url = URL.createObjectURL(recording);
    const anchor = document.createElement("a");
    anchor.download = `${fileUrl}.webm`;
    anchor.href = url;
    anchor.click();
  };

  return { recorder, startRecorder, stopRecorder };
}
