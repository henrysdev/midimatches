import { useEffect, useState, useMemo, useRef } from "react";
import { ChatMessage } from "../types";
import { MAX_CHAT_HISTORY_LENGTH } from "../constants";

export function useChat() {
  const [_chatHistory, setChatHistory] = useState<Array<ChatMessage>>([]);
  const chatHistoryRef = useRef<Array<ChatMessage>>([]);
  const [_msgCounter, setCurrMsg] = useState<number>(0);
  const msgCounterRef = useRef<number>(0);

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
    setCurrMsg((oldMsg) => {
      const newCurrMsg = oldMsg + 1;
      msgCounterRef.current = newCurrMsg;
      return newCurrMsg;
    });
  };

  return {
    chatHistory: chatHistoryRef.current,
    handleChatMessage,
    messageCounter: msgCounterRef.current,
  };
}
