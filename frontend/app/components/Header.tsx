"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

import { useAppContext } from "@/app/context";

import { CLOSE_SIDEBAR, TOGGLE_SIDEBAR } from "../actions";
import Sidebar from "./Sidebar";

const Header = () => {
  const { state, dispatch } = useAppContext();
  const { user } = useUser();

  const avatar =
    "data:image/jpeg;base64,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";

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between bg-gray-900 text-white px-4 py-2 shadow-lg h-16"
      onClick={() => dispatch({ type: CLOSE_SIDEBAR })}
    >
      {/* Logo */}
      <Link href="/" legacyBehavior passHref>
        <a className="flex items-center space-x-2">
          <Image
            priority
            src="/printer-icon.svg"
            alt="Logo"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold hidden sm:inline">Printee</span>
        </a>
      </Link>

      {/* Navigation & User Menu */}
      <div className="flex items-center space-x-4">
        {/* Coins */}
        <button className="relative p-2 hover:bg-gray-800 rounded-full">
          <span
            className={`absolute -top-0 -right-0 bg-red-600 text-xs rounded-full px- flex items-center justify-center ${
              state.user.coins >= 1000 ? "w-7 h-7 text-sm" : "w-5 h-5"
            }`}
          >
            {state.user.coins}
          </span>
          <Image src="/coins-icon.svg" alt="coins" width={40} height={40} />
        </button>

        {/* Profile */}
        <div className="relative">
          <button className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-full">
            <img
              src={user?.imageUrl || avatar}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
            />
          </button>
        </div>

        {/* Hamburger/Close Menu */}
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevents click from closing sidebar
              dispatch({ type: TOGGLE_SIDEBAR });
            }}
            className="p-2 hover:bg-gray-800 rounded-full cursor-pointer"
          >
            <Image
              src={state.isSidebar ? "/close-icon.svg" : "/menu-icon.svg"}
              alt={state.isSidebar ? "Close Menu" : "Open Menu"}
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>

      <Sidebar />
    </header>
  );
};

export default Header;
