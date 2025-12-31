import React from "react";
import JobbyLogo from "@/assets/icons/JobbyLogo.svg?react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItem = [
    { label: "Find Job", href: "/find" },
    { label: "Message", href: "/message" },
    { label: "Profile", href: "/profile" },
    { label: "Resume", href: "/resume" },
  ];

  return (
    <div data-theme="dark" className="h-full w-full box-border flex flex-col">
      {/* Navbar */}
      <div className="fixed w-full h-14 bg-white flex items-center border-b border-gray-200 shadow">
        <div className="px-2">
          <JobbyLogo height={50} width={100} />
        </div>
        <div className="grow px-2 flex gap-2 justify-end items-center">
          {navItem.map((item, index) => (
            <Link to={item.href} key={index}>
              <Button>{item.label}</Button>
            </Link>
          ))}
          <Link to={"/login"}>
            <Button>Login</Button>
          </Link>
        </div>
      </div>
      {/* Page Content */}
      <div className="w-full h-full pt-14">{children}</div>
    </div>
  );
}
