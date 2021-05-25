import React from "react";

const MobileAboutPage: React.FC = () => {
  return (
    <div className="mobile_content">
      <iframe
        width="100%"
        height="256px"
        src="https://www.youtube.com/embed/iVk7Va_hPis?autoplay=1&mute=1&start=43"
        allow="autoplay"
      ></iframe>
      <p
        style={{
          color: "var(--text_light)",
        }}
      >
        Midi Matches is a web-based multiplayer piano game that aims to combine
        the joy of playing improvisational keyboard with the thrill of friendly
        competition.
        <br />
        <br />
        Plug and play with any{" "}
        <a href="https://en.wikipedia.org/wiki/MIDI" className="accent_link">
          MIDI-capable
        </a>{" "}
        digital piano or type-to-play via a standard computer keyboard. No setup
        required!
        <br />
        <br />
        Ready to play? Switch over to a desktop browser!
        <br />
        <br />
        Project created by{" "}
        <a href="https://github.com/henrysdev" className="accent_link">
          Henry Warren
        </a>
      </p>
    </div>
  );
};
export { MobileAboutPage };
