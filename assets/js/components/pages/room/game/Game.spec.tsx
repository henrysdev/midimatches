import React from "react";
import { Channel, Socket } from "phoenix";
import { Game } from "./Game";
import { render, fireEvent, screen } from "@testing-library/react";
import { VIEW_UPDATE_EVENT } from "../../../../constants";

const mockedSocket = new Socket("fake_endpoint");
const mockedChannel = new Channel("fake_topic", {}, mockedSocket);
mockedChannel.join();

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
