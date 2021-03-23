import React, { useEffect, useState } from "react";

import { InGameFrame, GameSubContexts, GameLeftPane } from "../pages/room/game";
import {
  GameContext,
  ToneAudioContext,
  PlayerContext,
  KeyboardInputContext,
} from "../../contexts";
import { Keyboard } from "../audio";
import {
  GameStartView,
  RecordingView,
  PlaybackVotingView,
  RoundEndView,
} from "../pages/room/game/views";
import { Loop, GameContextType } from "../../types";
import { useWebMidi } from "../../hooks";
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
];

const mockedRecordings = {
  xb4z: {
    startTimestep: 0,
    length: 0,
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
    [
      "fearz123",
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
  ],
} as GameContextType;

const PregameDebug: React.FC = () => {
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
                  {/* <PlaybackVotingView
                    pushMessageToChannel={() => {}}
                    stopSample={() => {}}
                    isSamplePlayerLoaded={true}
                  /> */}
                  <RoundEndView />
                  <div></div>
                  {/* <RecordingView
                isContestant={true}
                pushMessageToChannel={() => {}}
                stopSample={() => {}}
              /> */}
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
            </ToneAudioContext.Provider>
          </PlayerContext.Provider>
        </GameSubContexts>
      </GameContext.Provider>
    </div>
  );
};
export { PregameDebug };
