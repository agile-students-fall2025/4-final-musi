import React from "react";
import styled from "styled-components";
import { theme } from "../theme";

const TabsWrapper = styled.nav`
  display: flex;
  justify-content: start;
  align-items: end;
  gap: 16px;
  border-bottom: 1px solid #D4D4D4;
  margin-bottom: 24px;

  scrollbar-gutter: stable both-edges; /* modern browsers */
  min-height: 44px; /* consistent height baseline */


  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }

  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

`;

const Tab = styled.button`
  background: none;
  border: none;
  border-bottom: ${(props) =>
    props.active ? `2px solid #000000` : "2px solid transparent"};
  font-size: 0.95rem;
  font-weight: ${(props) => (props.active ? 700 : 500)};
  color: ${(props) => (props.active ? theme.colors.text : theme.colors.text_secondary)};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 0;
  flex: 0 0 auto;
  white-space: nowrap;
  min-width: fit-content;
  transition: border-color 0.2s ease;

  span.count {
    background: ${(props) =>
      props.active ? theme.colors.accent : "rgba(134, 33, 154, 0.5)"};
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 999px;
  }
`;

export default function Tabs({ tabs, activeKey, onChange }) {
  return (
    <TabsWrapper>
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          active={tab.key === activeKey}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.count > 0 && <span className="count">{tab.count}</span>}
        </Tab>
      ))}
    </TabsWrapper>
  );
}
