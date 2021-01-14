import React from "react";
import { Channel, Socket } from "phoenix";
import { Game } from "./Game";
import { render, fireEvent, screen } from "@testing-library/react";
import { VIEW_UPDATE_EVENT } from "../../../../constants";

const mockedSocket = new Socket("fake_endpoint");
const mockedChannel = new Channel("fake_topic", {}, mockedSocket);
mockedChannel.join();

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

jest.mock("../../../../hooks/context", () => ({
  useToneAudioContext: jest.fn(() => {
    return { Tone: toneMock };
  }),
  useGameContext: jest.fn(() => {}),
}));

describe("renders Game component", () => {
  test("in game start view", () => {
    const musicianId = "123";
    const gameComponent = render(
      <Game gameChannel={mockedChannel} musicianId={musicianId} />
    ).baseElement;

    mockedChannel.push(VIEW_UPDATE_EVENT, {
      view: "game_start",
      gameState: {},
    });

    expect(gameComponent).toMatchSnapshot();
  });
});
