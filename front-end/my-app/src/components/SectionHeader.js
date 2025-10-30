import React from "react";
import styled from "styled-components";
import { theme } from "../theme";
import { ChevronDown } from "lucide-react";

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

const Chevron = styled(ChevronDown)`
  width: 22px;
  height: 22px;
  color: ${theme.colors.text};
  cursor: pointer;
`;

export default function SectionHeader({ title }) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <Chevron />
    </Wrapper>
  );
}
