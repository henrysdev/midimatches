import React, { useEffect, useState, useMemo } from "react";
import {
  Timer,
  TimerBox,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
} from "../../../../common";
import {
  useGameContext,
  useClockOffsetContext,
  usePlayerContext,
} from "../../../../../hooks";
import { calcMsUntilMsTimestamp } from "../../../../../utils";
import { WinResult, Player, RecordingTuple } from "../../../../../types";
import { WinResultText } from "../";
import { PlaybackAudio } from "../../../../audio";

interface RoundEndViewProps {
  isSamplePlayerLoaded: boolean;
  stopSample: Function;
}

const RoundEndView: React.FC<RoundEndViewProps> = ({
  isSamplePlayerLoaded,
  stopSample,
}) => {
  const {
    roundWinners,
    roundNum,
    recordings,
    gameRules: {
      viewTimeouts: { roundEnd: roundEndTimeout },
    },
    viewDeadline,
    players,
  } = useGameContext();

  const [winningPlayers, setWinningPlayers] = useState<Player[]>();

  const { clockOffset } = useClockOffsetContext();

  const { player: currPlayer } = usePlayerContext();

  useEffect(() => {
    if (!!roundWinners && roundWinners.winners.length && !!players) {
      const winnerIdsSet = new Set(roundWinners.winners);
      const newWinningPlayers = players.filter((player) =>
        winnerIdsSet.has(player.playerId)
      );
      setWinningPlayers(newWinningPlayers);
    }
  }, [roundNum]);

  const soleWinner = useMemo(() => {
    if (!!winningPlayers && !!recordings && winningPlayers.length === 1) {
      const soleRoundWinnerPlayerId = winningPlayers[0].playerId;
      const recordingIdx = recordings.findIndex((r: RecordingTuple) =>
        !!r ? r[0] === soleRoundWinnerPlayerId : false
      );
      const soleRoundWinnerRecording =
        recordingIdx === -1 ? undefined : recordings[recordingIdx][1];
      console.log({ soleRoundWinnerRecording });
      return {
        playerId: soleRoundWinnerPlayerId,
        recording: soleRoundWinnerRecording,
        recordingColor: "#FFFFFF",
      };
    }
  }, [winningPlayers]);

  return (
    <div className="view_container">
      <MediumLargeTitle title={`END OF ROUND ${roundNum}`} />
      <DynamicContent>
        {!!winningPlayers && !!roundWinners ? (
          <div>
            <WinResultText
              winResult={roundWinners}
              winningPlayers={winningPlayers}
              roundNum={roundNum}
              endOfGame={false}
            />
            {!!recordings &&
            !!soleWinner &&
            !!isSamplePlayerLoaded &&
            !!soleWinner.recording ? (
              <PlaybackAudio
                isCurrPlayer={
                  !!currPlayer && currPlayer.playerId === soleWinner.playerId
                }
                recording={soleWinner.recording}
                playerId={soleWinner.playerId}
                practiceMode={true}
                autoPlayingId={soleWinner.playerId}
                stopSample={stopSample}
                color={soleWinner.recordingColor}
                submitVote={() => {}}
                setActivePlaybackTrack={() => {}}
                isPlaying={isSamplePlayerLoaded}
                listenComplete={true}
                canVote={false}
                completeListening={() => {}}
                emptyRecording={false}
              />
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
      </DynamicContent>
      <TimerBox>
        <Timer
          descriptionText={"Next round in "}
          duration={calcMsUntilMsTimestamp(viewDeadline) + clockOffset}
        />
      </TimerBox>
    </div>
  );
};
export { RoundEndView };
