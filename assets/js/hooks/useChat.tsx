import { useEffect, useState, useMemo, useRef } from "react";
import { ChatMessage } from "../types";

type ChatTuple = [Array<ChatMessage>, (newMessage: ChatMessage) => void];

export function useChat(capacity: number): ChatTuple {
  const chatHistoryRef = useRef([]);
  const setChatHistory = (data: any) => {
    chatHistoryRef.current = data;
  };

  const handleChatMessage = (newMessage: ChatMessage) => {
    if (chatHistoryRef.current.length === capacity) {
      setChatHistory([
        ...chatHistoryRef.current.slice(1, capacity),
        newMessage,
      ]);
    } else {
      setChatHistory([...chatHistoryRef.current, newMessage]);
    }
  };

  return [chatHistoryRef.current, handleChatMessage];
}
