import React, { useState } from "react";

import { ChatMessage } from "../../../../types";
import { useChatContext } from "../../../../hooks";

interface ChatBoxProps {}

const ChatBox: React.FC<ChatBoxProps> = ({}) => {
  const { chatHistory, submitChatMessageEvent } = useChatContext();
  const [messageTextBuffer, setMessageTextBuffer] = useState<string>("");
  const handleTextBufferChange = (e: any) => {
    setMessageTextBuffer(e.target.value.trim());
  };

  const handleSubmitTextBuffer = () => {
    if (!!messageTextBuffer && messageTextBuffer.length > 0) {
      submitChatMessageEvent(messageTextBuffer);
    }
  };

  return (
    <div className="chat_box inline_screen">
      <div className="chat_messages_container">
        {chatHistory.map(
          (chatMessage: ChatMessage, index: number): JSX.Element => {
            return (
              <div key={index} className="chat_message_item">
                <div className="chat_message_author_label roboto_font">
                  {chatMessage.playerId}
                </div>
                <div className="chat_message_text roboto_font">
                  {chatMessage.messageText}
                </div>
              </div>
            );
          }
        )}
      </div>
      <div className="chat_text_entry_container">
        <input
          className="chat_text_entry"
          type="text"
          id="chat_text_entry"
          name="chat_text_entry"
          onChange={handleTextBufferChange}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmitTextBuffer();
            }
          }}
        />
        <input className="chat_send_button" type="submit" value="SEND" />
      </div>
    </div>
  );
};
export { ChatBox };
