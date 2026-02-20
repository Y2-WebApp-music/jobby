import React from "react";
import JobbyLogo from "@/assets/icons/JobbyLogo.svg?react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const navigate = useNavigate();

  return (
    <div data-theme="dark" className="h-full w-full box-border flex flex-col">
      {/* Navbar */}
      <div className="z-10 fixed w-full h-14 bg-white flex items-center border-b border-gray-200 shadow">
        <button onClick={() => navigate("/")} className="px-2 cursor-pointer">
          <JobbyLogo height={50} width={100} />
        </button>
        <div className="grow px-2 flex gap-2 justify-end items-center">
          {navItem.map((item, index) => (
            <Link to={item.href} key={index}>
              <Button>{item.label}</Button>
            </Link>
          ))}

          <Dialog>
            <DialogTrigger asChild>
              <Button>Login</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
              </DialogHeader>
              <InputGroup className="w-full">
                <InputGroupInput placeholder="Text Here" />
                <InputGroupButton>button</InputGroupButton>
              </InputGroup>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Page Content */}
      <div className="w-full h-full pt-14">{children}</div>
    </div>
  );
}
