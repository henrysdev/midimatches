import React from "react";

const HowToPlay: React.FC = () => {
  return (
    <div className="about_page_info inset_3d_border_shallow inline_screen">
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
            Midi Matches is intended to be played with a MIDI-capable piano
            keyboard. For the best experience, you'll want to have a MIDI
            keyboard connected to your computer. Alternatively, you can play via
            type-to-play with just your computer keys.
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
    </div>
  );
};
export { HowToPlay };
