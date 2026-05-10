import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { BsFillBriefcaseFill, BsFillGearFill } from "react-icons/bs";
import { MdBookmark } from "react-icons/md";
import { clearAuthStore } from "@/services/authClient";
import { authClient } from "@/services/authClient";
import { useState } from "react";

const menuItemClassName =
  "h-10 rounded-xl px-4 text-[16px] font-medium text-[#111111] focus:bg-[#f5f5f5] focus:text-[#111111]";

export default function UserMenuDropdown({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const displayName = user?.name?.trim() || "Username";
  const displayEmail = user?.email?.trim() || "email";
  const initials = displayName.slice(0, 1).toUpperCase();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      await authClient.signOut();
      clearAuthStore();
      window.location.replace("/");
    } catch (err: any) {
      // keep the user on the page and show an error / retry option
      // eslint-disable-next-line no-console
      console.error("Sign out failed", err);
      setError(err?.message || "Sign out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className={cn(
            "flex size-8 items-center justify-center rounded-full bg-[#d9d9d9] text-sm font-semibold text-[#555555] transition-transform hover:scale-[1.02]",
            triggerClassName,
          )}
        >
          {initials}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-[210px] min-w-[210px] rounded-2xl border border-[#e8e8e8] bg-white p-0 text-[#111111] shadow-[0_16px_36px_rgba(15,23,42,0.12)]"
      >
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#d9d9d9] text-sm font-semibold text-[#555555]">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[16px] leading-5 font-semibold text-[#111111]">
              {displayName}
            </div>
            <div className="truncate text-[13px] leading-4 text-[#8b8b8b]">
              {displayEmail}
            </div>
          </div>
        </div>

        <div className="px-2 pb-2">
          <DropdownMenuItem
            className={menuItemClassName}
            onSelect={() => navigate("/myjobs?view=applied")}
          >
            <BsFillBriefcaseFill className="size-4" />
            Applied history
          </DropdownMenuItem>

          <DropdownMenuItem
            className={menuItemClassName}
            onSelect={() => navigate("/myjobs?view=saved")}
          >
            <MdBookmark className="size-4" />
            Save Job
          </DropdownMenuItem>

          <DropdownMenuItem
            className={menuItemClassName}
            onSelect={() => navigate("/settings/account")}
          >
            <BsFillGearFill className="size-4" />
            Setting
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0 bg-[#ececec]" />

        <div className="p-2">
          <DropdownMenuItem
            className="h-10 justify-center rounded-xl px-4 text-[16px] font-medium text-[#ff2d2d] focus:bg-[#FFEAEB] focus:text-[#ff2d2d]"
            onSelect={() => {
              signOut();
              navigate("/");
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
