import React, { useEffect, useState } from "react";
import {
  Timer,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
} from "../../../../common";
import { useGameContext } from "../../../../../hooks";
import { Player } from "../../../../../types";
import { WinResultText } from "../";

interface GameEndViewProps {}

const GameEndView: React.FC<GameEndViewProps> = () => {
  const { gameWinners, players } = useGameContext();

  const [winningPlayers, setWinningPlayers] = useState<Player[]>();

  useEffect(() => {
    if (!!gameWinners && gameWinners.winners.length > 0 && !!players) {
      const winnerIdsSet = new Set(gameWinners.winners);
      const newWinningPlayers = players.filter((player) =>
        winnerIdsSet.has(player.playerId)
      );
      setWinningPlayers(newWinningPlayers);
    }
  }, [gameWinners]);

  return (
    <div>
      <MediumLargeTitle title="GAME END" />

      <DynamicContent>
        {!!winningPlayers && !!gameWinners ? (
          <WinResultText
            winResult={gameWinners}
            winningPlayers={winningPlayers}
            endOfGame={true}
          />
        ) : (
          <></>
        )}
      </DynamicContent>
    </div>
  );
};
export { GameEndView };
