import React from "react";
import styled from "styled-components";
import { theme } from "../theme";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
`;

const Chevron = styled.button`
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 9px;
    width: 10px;
    height: 2px;
    background: ${theme.colors.text};
    transform-origin: left center;
    border-radius: 2px;
  }
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(-45deg);
  }
`;

export default function SectionHeader({ title }) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <Chevron />
    </Wrapper>
  );
}
