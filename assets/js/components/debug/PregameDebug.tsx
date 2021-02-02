import React, { useEffect, useState } from "react";

import { GameLayout } from "../pages/room/game";
import { GameContext, ToneAudioContext, PlayerContext } from "../../contexts";
import { Instructions, Title, DynamicContent } from "../common";
import { Keyboard } from "../audio";
import { GameStartView, PlaybackVotingView } from "../pages/room/game/views";
import { Loop } from "../../types";
import { useWebMidi } from "../../hooks";

const mockTone = {
  Master: {
    mute: false,
  },
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
          scores: {
            fearz123: 0,
            xb4z: 2,
          },
          readyUps: [],
          recordings: {
            xb4z: {
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
          },
        }}
      >
        <PlayerContext.Provider value={{ player: mockedPlayers[0] }}>
          <ToneAudioContext.Provider value={{ midiInputs, Tone: mockTone }}>
            <GameLayout>
              <PlaybackVotingView
                pushMessageToChannel={() => {}}
                playSample={() => {}}
              />
            </GameLayout>
            {/* <GameLayout>
          <Title title="Starting Game" />
          <DynamicContent>
            <div>
              <Keyboard
                activeMidiList={[]}
                playNote={() => {}}
                stopNote={() => {}}
              />
            </div>
          </DynamicContent>
          <Instructions title="asdf" description={desc}></Instructions>
        </GameLayout> */}
          </ToneAudioContext.Provider>
        </PlayerContext.Provider>
      </GameContext.Provider>
    </div>
  );
};
export { PregameDebug };
