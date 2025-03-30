"use client";
import { useState } from "react";
import { FlexDiv } from "@/utils/styled";
import styled from "styled-components";

export interface MessageInputProps {
  onSend?: (message: string) => Promise<void>;
}

const ChatMessageInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  font-size: 1rem;
`

const ChatButton = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--accent-color);
  color: var(--text-color);
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: 0.3s;

  &:hover {
    background-color: var(--accent-color);
    color: #0A0F1A;
  }
`

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSendMessage = async (message: string) => {
    if (onSend) {
      await onSend(message);
    }
  }

  return (
    <FlexDiv className="gap-2">
      <ChatMessageInput placeholder="Input Message..." type="text" onKeyDown={async (e) => {
        if (e.keyCode === 13) {
          handleSendMessage(message);
          setMessage("");
        }
      }} value={message} onChange={(e) => setMessage(e.target.value)} />
      <ChatButton onClick={() => handleSendMessage(message)}>📤</ChatButton>
      <ChatButton>✅</ChatButton>
    </FlexDiv>
  )
}
