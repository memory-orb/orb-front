"use client";
import OperationGroup from "@/components/OperationGroup";
import ChatBox from "@/components/ChatBox/chat-box";
import styled from "styled-components";
import { FloatTech } from "@/utils/styled";

const Container = styled.div`
  max-width: 1000px;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
`

const Title = styled.h1`
  font-family: var(--font-orbitron), sans-serif;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--accent-color);
  text-shadow: 0 0 25px var(--glow-color), 0 0 60px var(--accent-color);
  animation: ${FloatTech} 5s ease-in-out infinite;
  margin-top: 0.67em;
  margin-bottom: 0.67em;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`

export default function Home() {
  return (
    <Container className="m-auto lg:ml-[220px]">
      <Title>Build Memories</Title>
      <ChatBox />
      <OperationGroup className="mt-8" />
    </Container>
  );
}
