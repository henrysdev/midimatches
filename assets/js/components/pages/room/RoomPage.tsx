import React, { useEffect, useState, useMemo } from "react";
import { Channel } from "phoenix";
import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "../";
import { RoomPageJoin, RoomPageContent } from ".";
import { LoadingSpinner } from "../../common";
import { SUBMIT_LEAVE_ROOM } from "../../../constants";

const RoomPage: React.FC = () => {
  const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);
  const [
    hasCheckedDomForPlayerType,
    setHasCheckedDomForPlayerType,
  ] = useState<boolean>(false);
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();
  const [roomChannel, setRoomChannel] = useState<Channel>();

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

    const roomChannel: Channel = socket.channel(`room:${roomId}`, {
      user_id: currentUser.userId,
    });
    roomChannel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });

    window.addEventListener("beforeunload", () => {
      roomChannel.push(SUBMIT_LEAVE_ROOM, {});
      roomChannel.leave();
    });

    setRoomChannel(roomChannel);

    return () => {
      roomChannel.leave();
    };
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
    <PageWrapper
      socket={socket}
      currentUser={currentUser}
      roomChannel={roomChannel}
    >
      {hasJoinedRoom && !!roomChannel ? (
        <RoomPageContent
          channel={roomChannel}
          roomId={roomId}
          isAudienceMember={isAudienceMember}
        />
      ) : hasCheckedDomForPlayerType ? (
        <RoomPageJoin roomId={roomId} />
      ) : (
        <LoadingSpinner />
      )}
    </PageWrapper>
  );
};
export { RoomPage };
