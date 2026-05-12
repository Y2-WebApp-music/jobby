import { useMemo, useState, type ComponentType, type FormEvent } from "react";
import { RiUser3Fill } from "react-icons/ri";
import { IoIosLock } from "react-icons/io";
import { IoChevronForward } from "react-icons/io5";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

type SettingsSection = "account-preferences" | "sign-in-security";

const sidebarItems: Array<{
  id: SettingsSection;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    id: "account-preferences",
    label: "Account preferences",
    icon: RiUser3Fill,
  },
  {
    id: "sign-in-security",
    label: "Sign in & Security",
    icon: IoIosLock,
  },
];

const profileInformationRows = [
  "Name, location, and industry",
  "Demographic info",
  "Skill",
  "Name, location, and industry",
];

const jobRows = ["Save Jobs", "Application History"];

const rowClassName =
  "flex items-center justify-between gap-4 px-4 py-[14px] text-left text-[15px] text-[#151515] transition-colors hover:bg-[#fafafa]";

export default function AccountSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    "account-preferences",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const displayName = user?.name?.trim() || "Username";
  const initials = displayName.slice(0, 1).toUpperCase();

  const securitySummary = useMemo(() => {
    if (successMessage) return successMessage;
    return "Keep your account secure by updating your password regularly.";
  }, [successMessage]);

  const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setFieldError("Please fill in all password fields.");
      setSuccessMessage("");
      return;
    }

    if (newPassword.length < 8) {
      setFieldError("New password must be at least 8 characters.");
      setSuccessMessage("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldError("New password and confirm password do not match.");
      setSuccessMessage("");
      return;
    }

    setFieldError("");
    setSuccessMessage("Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <PageLayout>
      <div className="min-h-full bg-white">
        <div className="grid min-h-[calc(100vh-56px)] grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-r border-[#f1f1f1] bg-[#fafafa] px-5 py-8">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9d9d9] text-sm font-semibold text-[#555555]">
                {initials}
              </div>
              <h1 className="text-[22px] font-semibold text-[#151515]">
                Setting
              </h1>
            </div>

            <div className="space-y-3">
              {sidebarItems.map((item) => {
                const active = activeSection === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`relative flex w-full items-center gap-3 px-1 py-2 text-left text-[15px] font-medium transition ${
                      active ? "text-[var(--color-main)]" : "text-[#151515]"
                    }`}
                  >
                    {active ? (
                      <span className="absolute -left-5 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--color-main)]" />
                    ) : null}
                    <Icon
                      className={
                        active
                          ? "text-[20px] text-[var(--color-main)]"
                          : "text-[20px] text-[#151515]"
                      }
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="px-10 py-9">
            {activeSection === "account-preferences" ? (
              <div className="max-w-[690px] space-y-4">
                <section className="overflow-hidden rounded-[18px] border border-[#f4f4f4] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
                  <div className="px-4 py-4 text-[15px] font-semibold text-[#151515]">
                    Profile information
                  </div>
                  <div className="border-t border-[#f0f0f0]">
                    {profileInformationRows.map((row, index) => (
                      <button
                        key={`${row}-${index}`}
                        type="button"
                        className={`${rowClassName} ${index !== 0 ? "border-t border-[#f0f0f0]" : ""}`}
                      >
                        <span>{row}</span>
                        <IoChevronForward className="text-[18px] text-[#151515]" />
                      </button>
                    ))}
                  </div>
                </section>

                <section className="overflow-hidden rounded-[18px] border border-[#f4f4f4] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
                  <div className="px-4 py-4 text-[15px] font-semibold text-[#151515]">
                    Job
                  </div>
                  <div className="border-t border-[#f0f0f0]">
                    {jobRows.map((row, index) => (
                      <button
                        key={row}
                        type="button"
                        className={`${rowClassName} ${index !== 0 ? "border-t border-[#f0f0f0]" : ""}`}
                      >
                        <span>{row}</span>
                        <IoChevronForward className="text-[18px] text-[#151515]" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="max-w-[690px] space-y-4">
                <section className="overflow-hidden rounded-[18px] border border-[#f4f4f4] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
                  <div className="border-b border-[#f0f0f0] px-5 py-4">
                    <div className="text-[16px] font-semibold text-[#151515]">
                      Sign in & Security
                    </div>
                    <p className="mt-1 text-sm text-[#7a7a7a]">
                      {securitySummary}
                    </p>
                  </div>

                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-4 px-5 py-5"
                  >
                    <div>
                      <label
                        htmlFor="current-password"
                        className="mb-2 block text-sm font-medium text-[#151515]"
                      >
                        Current password
                      </label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (fieldError) setFieldError("");
                        }}
                        className="h-11 rounded-2xl border-[#e7e7e7] bg-white px-4 text-sm"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-2 block text-sm font-medium text-[#151515]"
                      >
                        New password
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (fieldError) setFieldError("");
                        }}
                        className="h-11 rounded-2xl border-[#e7e7e7] bg-white px-4 text-sm"
                        placeholder="At least 8 characters"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="mb-2 block text-sm font-medium text-[#151515]"
                      >
                        Confirm new password
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldError) setFieldError("");
                        }}
                        className="h-11 rounded-2xl border-[#e7e7e7] bg-white px-4 text-sm"
                        placeholder="Re-enter new password"
                      />
                    </div>

                    {fieldError ? (
                      <div className="rounded-2xl border border-[#ffd3d6] bg-[#fff4f5] px-4 py-3 text-sm text-[#d11b2b]">
                        {fieldError}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-4 border-t border-[#f2f2f2] pt-4">
                      <div className="text-sm text-[#7a7a7a]">
                        This is the only editable item on this page.
                      </div>
                      <Button
                        type="submit"
                        className="h-10 rounded-full px-5 text-sm font-medium"
                      >
                        Change Password
                      </Button>
                    </div>
                  </form>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
