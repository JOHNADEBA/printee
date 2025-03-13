"use client";

import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { useAppContext } from "../context";
import { TOGGLE_SIDEBAR } from "../actions";
import { menuItems } from "../utils";

const Sidebar: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const handleSettings = () => {
    dispatch({ type: TOGGLE_SIDEBAR });
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-900 text-white shadow-lg p-4 flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden ${
        state.isSidebar ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Top Section */}
      <ul className="space-y-2">
        {menuItems.map(({ name, icon, url }, index) => (
          <li key={index}>
            <Link legacyBehavior href={url} passHref>
              <a
                onClick={handleSettings}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700"
              >
                {icon} <span>{name}</span>
              </a>
            </Link>
          </li>
        ))}
      </ul>

      {/* Spacer to push bottom content */}
      <div className="flex-grow mt-5" />

      {/* Bottom Section */}
      <div onClick={handleSettings}>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
};

export default Sidebar;
