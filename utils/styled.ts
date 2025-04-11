import styled, { keyframes } from "styled-components";

export const RecordsButton = styled.button`
  border-radius: 50px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50px;
`;

export const FlexDiv = styled.div`
  display: flex;
`;

export const OrbButton = styled.button`
  padding: 18px 36px;
  font-size: 1rem;
  border: 1.5px solid var(--accent-color);
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 12px var(--glow-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: var(--accent-color);
    color: #0A0F1A;
    box-shadow: 0 0 25px var(--glow-color);
    scale: 1.05;
  }
`

export const OrbButtonMiddle = styled.button`
  padding: 14px 25px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1.5px solid var(--accent-color);
  color: var(--text-color);
  font-size: 0.95rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 12px var(--glow-color);

  &:hover {
    background-color: var(--accent-color);
    color: #0A0F1A;
    box-shadow: 0 0 25px var(--glow-color);
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.85rem;
  }
`

export const OrbButtonSmall = styled.button`
  background-color: rgba(255, 255, 255, 0.02);
  border: 1.5px solid var(--accent-color);
  color: var(--text-color);
  padding: 10px 20px;
  font-size: 0.95rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 12px var(--glow-color);

  &:hover {
    background-color: var(--accent-color);
    color: #0A0F1A;
    box-shadow: 0 0 25px var(--glow-color);
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.85rem;
  }
`

export const FloatTech = keyframes`
  0%, 100% { transform: translateY(0); filter: brightness(1); }
  50% { transform: translateY(-12px) scale(1.02); filter: brightness(1.2); }
`

export const Title = styled.h1`
  font-family: var(--font-orbitron), sans-serif;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--accent-color);
  text-shadow: 0 0 25px var(--glow-color), 0 0 60px var(--accent-color);
  animation: ${FloatTech} 5s ease-in-out infinite;
  text-align: center;
  margin-top: 6rem;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`
