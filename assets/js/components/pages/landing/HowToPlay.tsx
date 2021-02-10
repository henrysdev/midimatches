import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const HowToPlay: React.FC = () => {
  return (
    <div
      style={{
        margin: "auto",
        marginTop: "16px",
        padding: "24px",
        boxShadow: "0 5px 15px rgb(0 0 0 / 8%)",
        color: "#666",
      }}
    >
      <dl className="uk-description-list uk-description-list-divider">
        <dt>
          <strong>Welcome!</strong>
        </dt>
        <br />
        <dd>
          <p>
            Midi Matches is a multiplayer improvisational keyboard game that
            aims to combine the joy of playing electronic keyboard with the
            thrill of friendly competition.
          </p>
        </dd>
        <dt>
          <strong>MIDI First</strong>
        </dt>
        <br />
        <dd>
          <p>
            Midi Matches is intended to be played with a MIDI keyboard. For the
            best experience, you'll want to have a MIDI keyboard plugged into
            your computer. Alternatively, you can play with your computer
            keyboard or click on notes.
          </p>
        </dd>
        <dt>
          <strong>How Do I Play?</strong>
        </dt>
        <br />
        <dd>
          <p>
            Each game consists of multiple rounds of recording and voting. The
            structure of a round is as follows; at the beginning of a round, a
            random sample beat is selected for all players to record over. Every
            player in the game then independently records their own keyboard
            solo over the sample beat. Players listen to all other players'
            recordings and vote on their favorite. The player with the most
            votes at the end of the game wins.
          </p>
        </dd>
      </dl>
    </div>
  );
};
export { HowToPlay };
