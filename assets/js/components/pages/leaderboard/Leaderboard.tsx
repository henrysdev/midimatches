import React, { useMemo, useState, useEffect } from "react";

import { MediumLargeTitle, LoadingSpinner } from "../../common";
import { LeaderboardRow } from "../../../types";
import { DEFAULT_LEADERBOARD_PAGE_SIZE } from "../../../constants";
import { useLoadLeaderboardRows } from "../../../hooks";

interface LeaderboardProps {}

const Leaderboard: React.FC<LeaderboardProps> = ({}) => {
  const [pageIdx, setPageIdx] = useState<number>(0);
  const [totalRowCount, setTotalRowCount] = useState<number>(0);
  const totalNumPages = useMemo(() => {
    const quotient = Math.floor(totalRowCount / DEFAULT_LEADERBOARD_PAGE_SIZE);
    const extraPage =
      Math.abs(totalRowCount % DEFAULT_LEADERBOARD_PAGE_SIZE) > 0 ? 1 : 0;
    console.log({ TOTAL_PAGES: "ok", totalRowCount, quotient, extraPage });
    return quotient + extraPage;
  }, [totalRowCount]);

  const [playerRankings, setPlayerRankings] = useState<LeaderboardRow[]>([]);
  const {
    data: rankingsData,
    httpStatus,
    loading,
    loaded,
    loadError,
    submitRequest,
  } = useLoadLeaderboardRows(pageIdx, DEFAULT_LEADERBOARD_PAGE_SIZE);
  useEffect(() => {
    if (!!rankingsData) {
      setPlayerRankings(rankingsData.playerRankings);
      setTotalRowCount(rankingsData.count);
    }
  }, [rankingsData]);

  const nextPage = () => {
    if (pageIdx + 1 < totalNumPages) {
      setPageIdx((prev) => prev + 1);
    }
  };
  const prevPage = () => {
    if (pageIdx > 0) {
      setPageIdx((prev) => prev - 1);
    }
  };

  return (
    <div style={{ height: "100%" }}>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <MediumLargeTitle centered={false}>
            <span className="accent_bars">///</span>LEADERBOARD
          </MediumLargeTitle>
        </div>
        <div style={{ flex: 2 }}>
          <h4 style={{ textAlign: "right" }}>
            Need Players?{" "}
            <a
              className="resource_link"
              target="_blank"
              href="https://discord.gg/yNQAp2JAxE"
              style={{
                padding: "4px",
                borderRadius: "2px",
                color: "white",
                backgroundColor: "#7289da",
                border: "1px solid white",
              }}
            >
              Join the Discord
            </a>
          </h4>
        </div>
      </div>

      <div className="serverlist_flex_anchor">
        <div className="serverlist_table_wrapper inset_3d_border_shallow inline_screen">
          {loaded ? (
            <table className="serverlist_table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Ties</th>
                  <th>Total Games</th>
                </tr>
              </thead>
              <tbody>
                {!!playerRankings ? (
                  playerRankings.map((playerRow: LeaderboardRow) => {
                    return (
                      <tr key={playerRow.playerId}>
                        <td>{playerRow.playerRank}</td>
                        <td>{playerRow.username}</td>
                        <td>{playerRow.playerScore}</td>
                        <td>{playerRow.winCount}</td>
                        <td>{playerRow.lossCount}</td>
                        <td>{playerRow.tieCount}</td>
                        <td>{playerRow.totalGames}</td>
                      </tr>
                    );
                  })
                ) : (
                  <></>
                )}
              </tbody>
            </table>
          ) : loading ? (
            <LoadingSpinner />
          ) : (
            <></>
          )}
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div style={{ position: "absolute" }}>
            <div
              onClick={() => prevPage()}
              style={{ width: 200, height: 100, border: "1px solid red" }}
            >
              PREV
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ position: "absolute", right: 0 }}>
            <div
              onClick={() => nextPage()}
              style={{ width: 200, height: 100, border: "1px solid red" }}
            >
              NEXT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export { Leaderboard };
