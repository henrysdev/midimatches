import React, { useEffect, useState, useMemo } from "react";

import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "../";
import { RoomPageJoin, RoomPageContent } from ".";
import { LoadingSpinner } from "../../common";

const RoomPage: React.FC = () => {
  const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);
  const [
    hasCheckedDomForPlayerType,
    setHasCheckedDomForPlayerType,
  ] = useState<boolean>(false);
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  useEffect(() => {
    const windowRef = window as any;
    if (!!windowRef.playerRole) {
      const handleRoomJoin = () => {
        const urlWithoutQueryParams = windowRef.location.pathname.replace(
          window.location.search,
          ""
        );
        windowRef.history.pushState(null, "", urlWithoutQueryParams);
        setHasJoinedRoom(true);
      };
      switch (windowRef.playerRole) {
        case "not_specified":
          setIsAudienceMember(false);
          break;
        case "audience_member":
          handleRoomJoin();
          setIsAudienceMember(true);
          break;
        case "player":
          handleRoomJoin();
          setIsAudienceMember(false);
          break;
        default:
          break;
      }
    }
    setHasCheckedDomForPlayerType(true);
  }, []);

  const roomId = useMemo(() => {
    const path = window.location.pathname
      .replace(window.location.search, "")
      .split("/")
      .filter((section) => section !== "");

    return path[path.length - 1];
  }, []);

  const [isAudienceMember, setIsAudienceMember] = useState<boolean>(false);

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      {hasJoinedRoom ? (
        <RoomPageContent roomId={roomId} isAudienceMember={isAudienceMember} />
      ) : hasCheckedDomForPlayerType ? (
        <RoomPageJoin
          setHasJoinedRoom={setHasJoinedRoom}
          setIsAudienceMember={setIsAudienceMember}
        />
      ) : (
        <LoadingSpinner />
      )}
      {/* <PregameDebug /> */}
    </PageWrapper>
  );
};
export { RoomPage };
