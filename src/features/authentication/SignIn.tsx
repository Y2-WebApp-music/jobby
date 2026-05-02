import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { useState, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

type SignInFieldErrors = Partial<Record<"email" | "password", string>>;

export default function SignIn({
  showCreateAccountLink = true,
}: {
  showCreateAccountLink?: boolean;
}) {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});

  const completeMockSignIn = (userEmail?: string) => {
    setUser({
      id: "demo-user",
      name: "Username",
      email: userEmail?.trim() || email.trim() || "email",
      role: "jobseeker",
      permissions: [],
    });
    setToken("demo-token");
    navigate("/profile");
  };

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: SignInFieldErrors = {
      email: email.trim() ? "" : "Please enter your email.",
      password: password.trim() ? "" : "Please enter your password.",
    };

    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    completeMockSignIn();
  };

  return (
    <form className="w-full" onSubmit={handleSignIn}>
      <div className="space-y-5">
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            className="h-12 rounded-2xl border-[#dedede] bg-white px-4 text-[15px] shadow-none placeholder:text-[#b8b8b8]"
          />
          {fieldErrors.email ? (
            <p className="text-[12px] font-medium text-[#ff4d4f]">
              {fieldErrors.email}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                className="h-12 rounded-2xl border-[#dedede] bg-white px-4 pr-10 text-[15px] shadow-none placeholder:text-[#b8b8b8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[#9a9a9a] transition-colors hover:text-[#6f6f6f]"
              >
                {showPassword ? (
                  <IoMdEyeOff className="size-4" />
                ) : (
                  <IoMdEye className="size-4" />
                )}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="text-[12px] font-medium text-[#ff4d4f]">
                {fieldErrors.password}
              </p>
            ) : null}
            <div className="text-right text-[13px]">
              <Link
                to="/forgot-password"
                className="cursor-pointer text-[#9a9a9a] transition-colors hover:text-primary-pink"
              >
                forgot password?
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="h-14 min-w-[154px] rounded-full px-10 text-[16px] font-medium text-white"
          >
            Sign In
          </Button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#7b7b7b]">
          <div className="h-px flex-1 bg-[#767676]" />
          <span>or</span>
          <div className="h-px flex-1 bg-[#767676]" />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-[#dadada] bg-white px-6 text-[15px] font-medium text-[#6f6f6f] transition-colors hover:bg-[#f8f8f8]"
          >
            <FcGoogle className="size-4" />
            Continue with Google
          </button>
        </div>

        {showCreateAccountLink ? (
          <div className="text-center text-[14px] text-[#222222]">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="inline-block cursor-pointer bg-gradient-to-r from-main to-second bg-clip-text font-medium text-transparent hover:opacity-90"
            >
              Create account
            </Link>
          </div>
        ) : null}
      </div>
    </form>
  );
}
