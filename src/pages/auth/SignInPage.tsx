import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobbyLogo from "@/assets/icons/JobbyLogologregis.svg?react";
import { Link, useNavigate } from "react-router-dom";
import {
  authClient,
  hydrateAuthStoreFromPayload,
  hydrateAuthStoreFromSession,
} from "@/services/authClient";
import { useState, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const callback = `${window.location.origin}/`;
      // newUserCallbackURL can be used to send new users to a different page after sign-up
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callback,
        newUserCallbackURL: callback,
      });
    } catch (err) {
      console.error("Google sign-in failed", err);
      setErrorMsg("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const onEmailSignIn = async (e?: FormEvent) => {
    e?.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      // sign in with email and password
      // API returns { data, error } shape in some clients
      // We'll handle both thrown errors and returned error objects.
      const res = (await authClient.signIn.email({
        email,
        password,
      })) as { error?: { message?: string } };

      // If library returns an object with error
      if (res?.error) {
        setErrorMsg(res.error?.message || "Sign in failed");
      } else {
        const hydrated = hydrateAuthStoreFromPayload(res);
        if (!hydrated) {
          await hydrateAuthStoreFromSession();
        }
        window.location.replace("/");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setErrorMsg(message);
      console.error("Email sign-in failed", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    if (mode === "signin") {
      void onEmailSignIn(e);
      return;
    }
    e.preventDefault();
    navigate("/register");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff8f3]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(255,142,0,0.34),transparent_28%),radial-gradient(circle_at_right_center,rgba(243,53,236,0.32),transparent_30%)]" />

      <div className="relative flex min-h-screen flex-col px-4 py-4 sm:px-6">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline_gradient"
            className="rounded-full px-5 text-[14px] font-medium"
          >
            Employer Site
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-[660px] flex-col items-center">
            <div className="mb-10 flex flex-col items-center">
              <JobbyLogo className="h-auto w-[320px] max-w-full" />
            </div>

            <section className="w-full rounded-[22px] border border-[#dddcdc] bg-white/98 px-8 py-14 shadow-[0_10px_28px_rgba(15,23,42,0.12)] sm:px-14">
              <h1 className="mb-10 text-center text-[28px] font-medium text-[#171717]">
                {mode === "signin" ? "Welcome Jobber" : "Create your account"}
              </h1>
              <div className="mb-8 grid grid-cols-2 gap-2 rounded-full bg-[#f4f4f4] p-1">
                <Button
                  type="button"
                  variant={mode === "signin" ? "default" : "ghost"}
                  className="h-11 rounded-full text-sm"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  type="button"
                  variant={mode === "signup" ? "default" : "ghost"}
                  className="h-11 rounded-full text-sm"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg(null);
                  }}
                >
                  Sign Up
                </Button>
              </div>

              <form className="space-y-5" onSubmit={onSubmit}>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  disabled={loading}
                  className="h-12 rounded-2xl border-[#dedede] bg-white px-4 text-[15px] shadow-none placeholder:text-[#b8b8b8]"
                />

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    disabled={loading}
                    className="h-12 rounded-2xl border-[#dedede] bg-white px-4 pr-12 text-[15px] shadow-none placeholder:text-[#b8b8b8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#9a9a9a] transition-colors hover:text-[#6f6f6f]"
                  >
                    {showPassword ? (
                      <IoMdEyeOff className="size-5" />
                    ) : (
                      <IoMdEye className="size-5" />
                    )}
                  </button>
                </div>

                {mode === "signup" ? (
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-12 rounded-2xl border-[#dedede] bg-white px-4 pr-12 text-[15px] shadow-none placeholder:text-[#b8b8b8]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#9a9a9a] transition-colors hover:text-[#6f6f6f]"
                    >
                      {showConfirmPassword ? (
                        <IoMdEyeOff className="size-5" />
                      ) : (
                        <IoMdEye className="size-5" />
                      )}
                    </button>
                  </div>
                ) : null}

                {mode === "signin" ? (
                  <div className="text-right text-[13px]">
                    <Link
                      to="/forgot-password"
                      className="cursor-pointer text-[#9a9a9a] transition-colors hover:text-primary-pink"
                    >
                      forgot password?
                    </Link>
                  </div>
                ) : null}

                {errorMsg ? (
                  <p className="rounded-xl bg-[#fff2f0] px-3 py-2 text-[13px] text-[#cf1322]">
                    {errorMsg}
                  </p>
                ) : null}

                <div className="flex justify-center pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-14 min-w-[154px] rounded-full px-10 text-[16px] font-medium text-white"
                  >
                    {loading
                      ? "Please wait..."
                      : mode === "signin"
                        ? "Sign In"
                        : "Join"}
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
                    onClick={() => void onGoogleSignIn()}
                    disabled={loading}
                    className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-[#dadada] bg-white px-6 text-[15px] font-medium text-[#6f6f6f] transition-colors hover:bg-[#f8f8f8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FcGoogle className="size-4" />
                    Continue with Google
                  </button>
                </div>
              </form>
            </section>

            <div className="mt-5 text-center text-[18px] text-[#222222]">
              {mode === "signin"
                ? "Don&apos;t have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode((prev) => (prev === "signin" ? "signup" : "signin"));
                  setErrorMsg(null);
                }}
                className="inline-block cursor-pointer bg-linear-to-r from-main to-second bg-clip-text font-semibold text-transparent hover:opacity-90"
              >
                {mode === "signin" ? "Create account" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
