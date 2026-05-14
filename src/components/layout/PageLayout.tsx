import React from "react";
import JobbyLogo from "@/assets/icons/JobbyLogo.svg?react";
import UserMenuDropdown from "@/components/layout/UserMenuDropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt3 } from "react-icons/hi";

type NavView = "auto" | "signed-in" | "guest";

type NavItem = {
  label: string;
  href: string;
  badge?: string;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "Find Job",
    href: "/searchjob",
    isActive: (pathname) => pathname.startsWith("/searchjob"),
  },
  {
    label: "Message",
    href: "/message",
    isActive: (pathname) => pathname.startsWith("/message"),
  },
  {
    label: "Profile",
    href: "/profile",
    isActive: (pathname) => pathname.startsWith("/profile"),
  },
  {
    label: "Resume",
    href: "/resume",
    isActive: (pathname) => pathname.startsWith("/resume"),
  },
];

function getNavItemActiveState(pathname: string, item: NavItem) {
  return pathname !== "/" && item.isActive(pathname);
}

export default function PageLayout({
  children,
  navView = "signed-in",
}: {
  children: React.ReactNode;
  navView?: NavView;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isSignedIn =
    navView === "guest" ? false : navView === "auto" ? user !== null : true;
  const renderNavLink = (item: NavItem) => {
    const active = getNavItemActiveState(location.pathname, item);

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "relative inline-flex h-10 shrink-0 items-center rounded-full px-3 text-[14px] font-medium transition-colors sm:h-9 sm:px-2.5 sm:text-[13px] lg:px-4 lg:text-[14px]",
          active
            ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
            : "text-[#262626] hover:bg-[#f7f7f7] hover:text-black",
        )}
      >
        <span>{item.label}</span>
        {item.badge ? (
          <span className="absolute top-1 right-1 flex min-w-5 -translate-y-1/4 items-center justify-center rounded-full bg-[#ff4d4f] px-1.5 text-[10px] leading-4 font-semibold text-white">
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  };
  const mobileMenuItemClassName =
    "h-10 rounded-xl px-4 text-[15px] font-medium text-[#111111] focus:bg-[#f5f5f5] focus:text-[#111111]";

  return (
    <div data-theme="dark" className="flex h-full w-full box-border flex-col">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-[#dcdcdc] bg-white/95 shadow-sm backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between gap-2 px-2 sm:gap-3 sm:px-4 lg:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="hidden shrink-0 cursor-pointer items-center sm:flex"
            aria-label="Go to landing page"
          >
            <JobbyLogo className="h-8 w-auto sm:h-12" />
          </button>

          {isSignedIn ? (
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-end sm:gap-3">
              <nav
                aria-label="Primary navigation"
                className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto whitespace-nowrap sm:justify-end sm:gap-2"
              >
                {navItems.map(renderNavLink)}
              </nav>
              <UserMenuDropdown triggerClassName="hidden shrink-0 sm:flex" />
            </div>
          ) : (
            <>
              <div className="hidden items-center gap-2 sm:gap-4 md:flex">
                <Button
                  type="button"
                  variant="outline_gradient"
                  onClick={() => navigate("/signin")}
                  className="rounded-full px-4 text-[14px] font-medium lg:px-5"
                >
                  Sign In
                </Button>

                <button
                  type="button"
                  className="cursor-pointer text-[14px] font-medium text-[#7a7a7a] transition-colors hover:text-[#3a3a3a]"
                >
                  Employer Site
                </button>
              </div>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open navigation menu"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ececec] text-[#262626] transition-colors hover:bg-[#f6f6f6]"
                    >
                      <HiOutlineMenuAlt3 className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={12}
                    className="w-[220px] rounded-2xl border border-[#e8e8e8] bg-white p-2 shadow-[0_16px_36px_rgba(15,23,42,0.12)]"
                  >
                    <DropdownMenuItem
                      className={mobileMenuItemClassName}
                      onSelect={() => navigate("/signin")}
                    >
                      Sign In
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="mx-0 my-1 bg-[#ececec]" />

                    <DropdownMenuItem className={mobileMenuItemClassName}>
                      Employer Site
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="min-h-0 w-full flex-1 pt-14">{children}</div>
    </div>
  );
}
