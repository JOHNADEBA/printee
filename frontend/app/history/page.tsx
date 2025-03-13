"use client";

import React, { MouseEvent as ReactMouseEvent } from "react";

import { useAppContext } from "../context";
import { CLOSE_SIDEBAR, HISTORY } from "../actions";
import Documents from "../components/Documents";

const Printqueue: React.FC = () => {
  const { dispatch } = useAppContext();

  const closeSidebar = (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    dispatch({ type: CLOSE_SIDEBAR });
  };
  return (
    <div className="min-h-[calc(100vh-4rem)]" onClick={(e) => closeSidebar(e)}>
      <Documents type={HISTORY} />;
    </div>
  );
};

export default Printqueue;
