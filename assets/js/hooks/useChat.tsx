import { useEffect, useState, useMemo, useRef } from "react";
import { ChatMessage } from "../types";
import { MAX_CHAT_HISTORY_LENGTH } from "../constants";

type ChatTuple = [Array<ChatMessage>, (newMessage: ChatMessage) => void];

export function useChat(): ChatTuple {
  const [_chatHistory, setChatHistory] = useState<Array<ChatMessage>>([]);
  const chatHistoryRef = useRef<Array<ChatMessage>>([]);

  const handleChatMessage = (newMessage: ChatMessage) => {
    if (chatHistoryRef.current.length === MAX_CHAT_HISTORY_LENGTH) {
      setChatHistory((history) => {
        const newChatHistory = [
          ...history.slice(1, MAX_CHAT_HISTORY_LENGTH),
          newMessage,
        ];
        chatHistoryRef.current = newChatHistory;
        return newChatHistory;
      });
    } else {
      setChatHistory((history) => {
        const newChatHistory = [...history, newMessage];
        chatHistoryRef.current = newChatHistory;
        return newChatHistory;
      });
    }
  };

  return [chatHistoryRef.current, handleChatMessage];
}
