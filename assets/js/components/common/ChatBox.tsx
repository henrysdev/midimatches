import React, { useState, useEffect, useMemo, memo } from "react";

import { ChatMessage, Player } from "../../types";
import { useChatContext, useKeyboardInputContext } from "../../hooks";
import { MAX_CHARS_PER_CHAT_MESSAGE } from "../../constants";

interface ChatBoxProps {
  players: Array<Player>;
  currPlayer: Player;
}

const ChatBox: React.FC<ChatBoxProps> = memo(({ players, currPlayer }) => {
  const { setDisableKeyboardInput } = useKeyboardInputContext();
  const { chatHistory, submitChatMessageEvent } = useChatContext();

  const [messageTextBuffer, setMessageTextBuffer] = useState<string>("");

  const handleTextBufferChange = (e: any) => {
    setMessageTextBuffer(e.target.value);
  };

  const trimmedTextBuffer = useMemo(() => {
    return messageTextBuffer.trim();
  }, [messageTextBuffer]);

  const handleSubmitTextBuffer = () => {
    if (!!trimmedTextBuffer && trimmedTextBuffer.length > 0) {
      submitChatMessageEvent(trimmedTextBuffer);
      setMessageTextBuffer("");
    }
  };

  const [allSeenPlayers, setAllSeenPlayers] = useState<any>({});

  useEffect(() => {
    const updatedSeenPlayers = players.reduce((acc, player) => {
      acc[player.playerId] = player;
      return acc;
    }, allSeenPlayers);
    setAllSeenPlayers(updatedSeenPlayers);
  }, [players.length]);

  return (
    <div className="chat_box inline_screen">
      <div className="chat_messages_container">
        {chatHistory.map(
          (
            { playerId, messageText }: ChatMessage,
            index: number
          ): JSX.Element => {
            return (
              <div key={index} className="chat_message_item">
                <span
                  className="chat_message_author_label roboto_font"
                  style={
                    !!currPlayer && playerId === currPlayer.playerId
                      ? { color: "var(--current_player_color)" }
                      : {}
                  }
                >
                  {playerId in allSeenPlayers
                    ? allSeenPlayers[playerId].playerAlias
                    : playerId}
                  {": "}
                </span>
                <span className="chat_message_text roboto_font">
                  {messageText}
                </span>
              </div>
            );
          }
        )}
      </div>
      <div className="chat_text_entry_container">
        <input
          autoComplete="off"
          className="chat_text_entry roboto_font"
          type="text"
          id="chat_text_entry"
          name="chat_text_entry"
          maxLength={MAX_CHARS_PER_CHAT_MESSAGE}
          value={messageTextBuffer}
          onFocus={() => setDisableKeyboardInput(true)}
          onBlur={() => setDisableKeyboardInput(false)}
          onChange={handleTextBufferChange}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmitTextBuffer();
            }
          }}
        />
        <input
          className="styled_button chat_send_button roboto_font"
          type="submit"
          value="Send"
          onClick={() => handleSubmitTextBuffer()}
        />
      </div>
    </div>
  );
});
export { ChatBox };
