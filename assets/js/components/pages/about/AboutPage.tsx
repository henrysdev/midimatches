import React from "react";
import { ComputerFrame, ComputerButton, MediumLargeTitle } from "../../common";
import { HowToPlay } from ".";
import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "..";

const AboutPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();
  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <ComputerFrame>
        <div className="about_page_content">
          <div>
            <MediumLargeTitle centered={false}>
              <span className="accent_bars">///</span>ABOUT
            </MediumLargeTitle>
            <HowToPlay />
            <div className="about_page_play_button_container">
              <ComputerButton callback={() => (window.location.href = "/menu")}>
                LET'S PLAY!
              </ComputerButton>
            </div>
            <div className="developer_about_tagline_flex_wrapper">
              <div className="developer_about_tagline">
                Alpha stage project; all feedback and bug reports welcome via{" "}
                <a
                  className="resource_link"
                  target="_blank"
                  href="https://discord.gg/yNQAp2JAxE"
                >
                  Discord
                </a>{" "}
                or{" "}
                <a className="resource_link" href="mailto:henrysdev@gmail.com">
                  email
                </a>
                . <br /> <br />
                <a
                  className="resource_link"
                  target="_blank"
                  href="https://github.com/henrysdev/midimatches"
                >
                  Open source
                </a>{" "}
                and proudly built with{" "}
                <a
                  className="resource_link elixir_accent"
                  target="_blank"
                  href="https://elixir-lang.org/"
                >
                  Elixir
                </a>
                . Created by{" "}
                <a
                  className="resource_link"
                  target="_blank"
                  href="https://github.com/henrysdev"
                >
                  @henrysdev
                </a>
                .
                {/* <br />
                <br /> If you enjoy this game, please consider
                <a
                  className="resource_link"
                  target="_blank"
                  href="https://www.patreon.com/midimatches"
                >
                  {" "}
                  becoming a patron ❤️{" "}
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </ComputerFrame>
    </PageWrapper>
  );
};
export { AboutPage };
