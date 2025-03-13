import React from "react";
import { MdUploadFile, MdPrint, MdHistory, MdPayment } from "react-icons/md";
import { MenuItems } from "./types";

// Define the structure of category data
export const menuItems: MenuItems[] = [
  {
    name: "ADD DOCUMENT",
    icon: React.createElement(MdUploadFile, { size: 20 }),
    url: "/add-document",
  },
  {
    name: "PRINT QUEUE",
    icon: React.createElement(MdPrint, { size: 20 }),
    url: "/",
  },
  {
    name: "HISTORY",
    icon: React.createElement(MdHistory, { size: 20 }),
    url: "/history",
  },
  {
    name: "ADD COINS",
    icon: React.createElement(MdPayment, { size: 20 }),
    url: "/add-coins",
  },
];
