import React from "react";

const HowToPlay: React.FC = () => {
  return (
    <div className="landing_page_info inset_3d_border_shallow inline_screen">
      <dl>
        <dd>
          <p>
            MIDI Matches is a multiplayer improvisational piano game that aims
            to combine the joy of playing electronic keyboard with the thrill of
            friendly competition.
          </p>
        </dd>
        <br />
        <dt>
          <h4>MIDI FIRST</h4>
        </dt>
        <dd>
          <p>
            MIDI Matches is intended to be played with a MIDI-capable piano. For
            the best experience, you'll want to have a MIDI piano plugged into
            your computer. Alternatively, you can play with your computer
            keyboard.
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
