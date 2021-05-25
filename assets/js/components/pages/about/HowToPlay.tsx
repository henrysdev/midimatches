import React from "react";

const HowToPlay: React.FC = () => {
  return (
    <div className="about_page_info inset_3d_border_shallow inline_screen">
      <div style={{ display: "flex" }}>
        <div
          style={{
            flex: 1,
            margin: "auto",
            padding: "8px",
            width: "50%",
            backgroundColor: "black",
          }}
        >
          <iframe
            width="100%"
            height="300px"
            src="https://www.youtube.com/embed/iVk7Va_hPis?autoplay=1&mute=1&start=43"
            allow="autoplay; fullscreen;"
          ></iframe>
        </div>
      </div>
      <dl>
        <dd>
          <p>
            Midi Matches is a free-to-play web-based multiplayer piano game that
            aims to combine the joy of playing improvisational keyboard with the
            thrill of friendly competition. Midi Matches supports MIDI-capable
            pianos as well as type-to-play via a standard computer keyboard.
          </p>
        </dd>
        <br />
        <dt>
          <h4>MIDI FIRST</h4>
        </dt>
        <dd>
          <p>
            Plug and play with any{" "}
            <a
              href="https://en.wikipedia.org/wiki/MIDI"
              className="accent_link"
            >
              MIDI-capable
            </a>{" "}
            digital piano or type-to-play via a standard computer keyboard. No
            setup required!
          </p>
        </dd>
        <br />
        <dt>
          <h4>HOW DO I PLAY?</h4>
        </dt>
        <dd>
          <p>
            Each game consists of multiple rounds of recording and voting. The
            structure of a round is as follows; at the beginning of a round, a
            random backing track is selected for all players to record over.
            Every player in the game then independently records their own
            keyboard solo over the backing track. Players listen to all
            recordings and then vote on their favorite. The player with the most
            votes at the end of the game wins.
          </p>
        </dd>
      </dl>
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
  );
};
export { HowToPlay };
