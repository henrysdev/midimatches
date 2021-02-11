import React, { useEffect, useState } from "react";

import { GameLayout } from "../pages/room/game";
import { GameContext, ToneAudioContext, PlayerContext } from "../../contexts";
import { Keyboard } from "../audio";
import {
  GameStartView,
  RecordingView,
  PlaybackVotingView,
  RoundEndView,
} from "../pages/room/game/views";
import { Loop } from "../../types";
import { useWebMidi } from "../../hooks";
import { DynamicContent } from "../common";
import Tone from "tone";

interface FakeTone {
  Master: any;
  PolySynth: any;
  toDestination: any;
}
const mockTone: FakeTone = {
  Master: {
    mute: false,
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

const mockedPlayers = [
  { playerAlias: "xb4z", musicianId: "1199" },
  { playerAlias: "fearz123", musicianId: "1111" },
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

const PregameDebug: React.FC = () => {
  const [midiInputs] = useWebMidi();
  return (
    <div>
      <GameContext.Provider
        value={{
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
        }}
      >
        <PlayerContext.Provider value={{ player: mockedPlayers[0] }}>
          <ToneAudioContext.Provider value={{ midiInputs, Tone: Tone }}>
            {/* <GameLayout>
              <PlaybackVotingView
                pushMessageToChannel={() => {}}
                playSample={() => {}}
                stopSample={() => {}}
              />
            </GameLayout> */}
            <DynamicContent>
              <div>
                <Keyboard
                  activeMidiList={[50]}
                  playNote={(noteNumber: number) => {
                    console.log("note number ", noteNumber);
                  }}
                  stopNote={() => {}}
                />
              </div>
            </DynamicContent>
          </ToneAudioContext.Provider>
        </PlayerContext.Provider>
      </GameContext.Provider>
    </div>
  );
};
export { PregameDebug };
