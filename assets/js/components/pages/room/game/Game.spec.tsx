import React from "react";
import { Channel, Socket } from "phoenix";
import { Game } from "./Game";
import { render, fireEvent, screen } from "@testing-library/react";
import { GAME_VIEW } from "../../../../constants";
import { mocked } from "ts-jest/utils";
import { useGameServerState, useToneAudioContext } from "../../../../hooks";

const mockedSocket = new Socket("fake_endpoint");
const mockedChannel = new Channel("fake_topic", {}, mockedSocket);
mockedChannel.join();

const gameRulesMock = {
  gameSizeNumPlayers: 4,
  soloTimeLimit: 30,
  timestepSize: 500,
  quantizationThreshold: 0.6,
};

const pushMessageMock = () => {};

const tonePlayerMock = {
  toDestination: () => tonePlayerMock,
  volume: {
    value: 0,
  },
};
const toneMock = {
  Player: () => tonePlayerMock,
  now: () => 10,
};
const mockGameStartView = GAME_VIEW.GAME_START;
jest.mock("../../../../hooks/context", () => ({
  useToneAudioContext: jest.fn(() => {
    return { Tone: toneMock };
  }),
  useGameContext: jest.fn(() => {}),
  // useGameServerState: jest.fn(() => {
  //   return [mockGameStartView, {}, () => {}];
  // }),
  useSamplePlayer: jest.fn(() => [() => {}, () => {}, () => {}]),
}));

describe("renders Game component", () => {
  beforeEach(() => {
    mocked(useToneAudioContext).mockReturnValueOnce({ Tone: toneMock });
  });
  test("in game start view", () => {
    // mocked(useGameServerState).mockReturnValueOnce([
    //   mockGameStartView,
    //   {
    //     gameRules: gameRulesMock,
    //     gameView: "game_start",
    //   },
    //   pushMessageMock,
    // ]);

    const musicianId = "123";
    const gameComponent = render(
      <Game gameChannel={mockedChannel} musicianId={musicianId} />
    ).baseElement;

    expect(gameComponent).toMatchSnapshot();
  });

  // test("in round start view", () => {
  //   mocked(useToneAudioContext).mockReturnValueOnce({ Tone: toneMock });
  //   const musicianId = "123";
  //   const gameComponent = render(
  //     <Game gameChannel={mockedChannel} musicianId={musicianId} />
  //   ).baseElement;

  //   expect(gameComponent).toMatchSnapshot();
  // });
});
