import React, { useEffect, useState } from "react";

import { InGameFrame, GameSubContexts, GameLeftPane } from "../pages/room/game";
import {
  GameContext,
  ToneAudioContext,
  PlayerContext,
  KeyboardInputContext,
  BackingTrackContext,
} from "../../contexts";
import { Keyboard } from "../audio";
import {
  GameStartView,
  RecordingView,
  PlaybackVotingView,
  RoundEndView,
} from "../pages/room/game/views";
import { Loop, GameContextType } from "../../types";
import { useWebMidi, useBackingTrackContextProvider } from "../../hooks";
import { DynamicContent, ComputerFrame } from "../common";
import Tone from "tone";

interface FakeTone {
  Master: any;
  PolySynth: any;
  toDestination: any;
}
const mockTone: FakeTone = {
  Master: {
    mute: false,
    volume: {
      value: 0,
    },
  },
  PolySynth: (param: any): FakeTone => {
    return {
      Master: {
        mute: false,
      },
      PolySynth: (param: any): FakeTone => {
        return {} as FakeTone;
      },
      toDestination: () => {},
    };
  },
  toDestination: () => {},
};

const mockSamplePlayer: any = {
  loop: (_p: any) => {},
  stop: (_p?: any) => {},
  start: (_p?: any) => {},
  seek: (_p: any) => {},
};

const mockedPlayers = [
  { playerAlias: "xb4z", playerId: "1199" },
  { playerAlias: "fearz123", playerId: "1111" },
  { playerAlias: "egg", playerId: "811241242" },
  { playerAlias: "blurr", playerId: "16611g21221" },
];

const mockedRecordings = {
  xb4z: {
    timestepSlices: [
      {
        timestep: 1,
        notes: [
          {
            key: 65,
            duration: 2,
            velocity: 1,
          },
          {
            key: 67,
            duration: 2,
            velocity: 1,
          },
          {
            key: 69,
            duration: 2,
            velocity: 1,
          },
        ],
      },
    ],
    timestepSize: 50,
  } as Loop,
};

const gameContext = {
  players: mockedPlayers,
  gameRules: {
    viewTimeouts: {
      gameStart: 10_000,
      playbackVoting: 10_000,
    },
    timestepSize: 10_000,
  },
  scores: [
    ["fearz123", 0],
    ["xb4z", 2],
  ],
  readyUps: [],
  roundWinners: {
    winners: ["1199"],
    numPoints: 2,
  },
  roundNum: 2,
  roundRecordingStartTime: 100,
  recordings: [
    [
      "xb4z",
      {
        timestepSlices: [
          {
            timestep: 4,
            notes: [
              {
                key: 54,
                duration: 14,
              },
              {
                key: 64,
                duration: 12,
              },
            ],
          },
          {
            timestep: 41,
            notes: [
              {
                key: 14,
                duration: 20,
              },
              {
                key: 4,
                duration: 14,
              },
            ],
          },
          {
            timestep: 200,
            notes: [
              {
                key: 88,
                duration: 4,
              },
              {
                key: 65,
                duration: 40,
              },
            ],
          },
        ],
      },
    ],
    // [
    //   "fearz123",
    //   {
    //     timestepSlices: [
    //       {
    //         timestep: 4,
    //         notes: [
    //           {
    //             key: 54,
    //             duration: 14,
    //           },
    //           {
    //             key: 64,
    //             duration: 12,
    //           },
    //         ],
    //       },
    //       {
    //         timestep: 41,
    //         notes: [
    //           {
    //             key: 14,
    //             duration: 20,
    //           },
    //           {
    //             key: 4,
    //             duration: 14,
    //           },
    //         ],
    //       },
    //       {
    //         timestep: 200,
    //         notes: [
    //           {
    //             key: 88,
    //             duration: 4,
    //           },
    //           {
    //             key: 65,
    //             duration: 40,
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
    // [
    //   "egg",
    //   {
    //     timestepSlices: [
    //       {
    //         timestep: 4,
    //         notes: [
    //           {
    //             key: 54,
    //             duration: 14,
    //           },
    //           {
    //             key: 64,
    //             duration: 12,
    //           },
    //         ],
    //       },
    //       {
    //         timestep: 41,
    //         notes: [
    //           {
    //             key: 14,
    //             duration: 20,
    //           },
    //           {
    //             key: 4,
    //             duration: 14,
    //           },
    //         ],
    //       },
    //       {
    //         timestep: 200,
    //         notes: [
    //           {
    //             key: 88,
    //             duration: 4,
    //           },
    //           {
    //             key: 65,
    //             duration: 40,
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
    // [
    //   "blurr",
    //   {
    //     timestepSlices: [
    //       {
    //         timestep: 4,
    //         notes: [
    //           {
    //             key: 54,
    //             duration: 14,
    //           },
    //           {
    //             key: 64,
    //             duration: 12,
    //           },
    //         ],
    //       },
    //       {
    //         timestep: 41,
    //         notes: [
    //           {
    //             key: 14,
    //             duration: 20,
    //           },
    //           {
    //             key: 4,
    //             duration: 14,
    //           },
    //         ],
    //       },
    //       {
    //         timestep: 200,
    //         notes: [
    //           {
    //             key: 88,
    //             duration: 4,
    //           },
    //           {
    //             key: 65,
    //             duration: 40,
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
  ],
} as GameContextType;

const backingTrack = {
  name: "jazzyyy",
  fileUrl: "https://progressions-game.s3.amazonaws.com/sample-beats/alt_1.mp3",
  bpm: 90,
  musicalKey: "C",
  author: "me",
};

const PregameDebug: React.FC = () => {
  const backingTrackContext = useBackingTrackContextProvider(backingTrack);
  const [midiInputs] = useWebMidi();
  return (
    <div>
      <GameContext.Provider value={{ ...gameContext }}>
        <GameSubContexts gameContext={gameContext}>
          <PlayerContext.Provider value={{ player: mockedPlayers[0] }}>
            <ToneAudioContext.Provider
              value={{
                midiInputs,
                Tone: mockTone,
                samplePlayer: mockSamplePlayer,
              }}
            >
              <BackingTrackContext.Provider value={backingTrackContext}>
                <KeyboardInputContext.Provider
                  value={{
                    setDisableKeyboardInput: () => {},
                    disableKeyboardInput: false,
                    setShowKeyboardLabels: () => {},
                    showKeyboardLabels: true,
                  }}
                >
                  <InGameFrame title="AAA">
                    <GameLeftPane />

                    <PlaybackVotingView
                      pushMessageToChannel={() => {}}
                      stopSample={() => {}}
                      isSamplePlayerLoaded={true}
                    />
                  </InGameFrame>
                  {/* <DynamicContent>
              <div>
                <Keyboard
                  activeMidiList={[50]}
                  playNote={(noteNumber: number) => {
                    console.log("note number ", noteNumber);
                  }}
                  stopNote={() => {}}
                />
              </div>
            </DynamicContent> */}
                </KeyboardInputContext.Provider>
              </BackingTrackContext.Provider>
            </ToneAudioContext.Provider>
          </PlayerContext.Provider>
        </GameSubContexts>
      </GameContext.Provider>
    </div>
  );
};
export { PregameDebug };
