import React from "react";

interface TournamentProps {
  // TODO
}
const Tournament: React.FC<TournamentProps> = ({}) => {
  return (
    <div className="tournament">
      {/* LEFT SIDE */}
      <ul className="round">
        <li className="spacer">&nbsp;</li>

        <li className="game_left game_top">team A</li>
        <li className="game_left spacer">&nbsp;</li>
        <li className="game_left game_bottom">team B</li>

        <li className="spacer">&nbsp;</li>

        <li className="game_left game_top">team C</li>
        <li className="game_left spacer">&nbsp;</li>
        <li className="game_left game_bottom">team D</li>

        <li className="spacer">&nbsp;</li>
      </ul>

      <ul className="round">
        <li className="spacer">&nbsp;</li>

        <li className="game_left game_top">team A</li>
        <li className="game_left spacer">&nbsp;</li>
        <li className="game_left game_bottom">team D</li>

        <li className="spacer">&nbsp;</li>
      </ul>

      <ul className="round">
        <li className="spacer">&nbsp;</li>

        <li className="game_left game_top">team A</li>

        <li className="spacer">&nbsp;</li>
      </ul>

      {/* CENTER */}
      <ul className="round champion">
        <li className="spacer">&nbsp;</li>

        <li className="game_center">team H</li>

        <li className="spacer">&nbsp;</li>
      </ul>

      {/* RIGHT SIDE */}
      <ul className="round">
        <li className="spacer">&nbsp;</li>

        <li className="game_right game_top">team H</li>

        <li className="spacer">&nbsp;</li>
      </ul>

      <ul className="round">
        <li className="spacer">&nbsp;</li>

        <li className="game_right game_top">team E</li>
        <li className="game_right spacer">&nbsp;</li>
        <li className="game_right game_bottom">team H</li>

        <li className="spacer">&nbsp;</li>
      </ul>

      <ul className="round">
        <li className="spacer">&nbsp;</li>

        <li className="game_right game_top">team E</li>
        <li className="game_right spacer">&nbsp;</li>
        <li className="game_right game_bottom">team F</li>

        <li className="spacer">&nbsp;</li>

        <li className="game_right game_top">team G</li>
        <li className="game_right spacer">&nbsp;</li>
        <li className="game_right game_bottom">team H</li>

        <li className="spacer">&nbsp;</li>
      </ul>
    </div>
  );
};
export { Tournament };
