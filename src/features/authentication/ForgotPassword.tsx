import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

type ForgotPasswordStep = 1 | 2 | 3;
type ForgotPasswordErrors = Partial<
  Record<"email" | "otp" | "password" | "confirmPassword", string>
>;

const MOCK_OTP = "000000";
const MOCK_OLD_PASSWORD = "password123";

export default function ForgotPassword({
  step,
  onStepChange,
}: {
  step: ForgotPasswordStep;
  onStepChange: (step: ForgotPasswordStep) => void;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordErrors>({});
  const [alertMessage, setAlertMessage] = useState("");

  const clearMessages = () => {
    if (alertMessage) setAlertMessage("");
  };

  const handleSendOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: ForgotPasswordErrors = {
      email: email.trim() ? "" : "Please enter your email.",
    };

    setFieldErrors(nextErrors);
    clearMessages();

    if (nextErrors.email) return;

    onStepChange(2);
  };

  const handleConfirmOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: ForgotPasswordErrors = {
      otp: otp.trim() ? "" : "Please enter OTP.",
    };

    setFieldErrors(nextErrors);
    clearMessages();

    if (nextErrors.otp) return;

    if (otp.trim() !== MOCK_OTP) {
      setFieldErrors((prev) => ({
        ...prev,
        otp: "Invalid OTP. Please try again.",
      }));
      return;
    }

    onStepChange(3);
  };

  const handleUpdatePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: ForgotPasswordErrors = {
      password: password.trim() ? "" : "Please enter new password.",
      confirmPassword: confirmPassword.trim()
        ? ""
        : "Please confirm your new password.",
    };

    setFieldErrors(nextErrors);
    setAlertMessage("");

    if (nextErrors.password || nextErrors.confirmPassword) return;

    if (password.length < 8) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters.",
      }));
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("New password and confirm password do not match.");
      return;
    }

    if (password === MOCK_OLD_PASSWORD) {
      setAlertMessage("New password cannot be the same as your old password.");
      return;
    }

    navigate("/signin");
  };

  const renderAlert = () =>
    alertMessage ? (
      <div className="rounded-2xl border border-[#ffd3d6] bg-[#fff4f5] px-4 py-3 text-[12px] font-medium text-[#d11b2b]">
        {alertMessage}
      </div>
    ) : null;

  if (step === 1) {
    return (
      <form className="w-full" onSubmit={handleSendOtp}>
        <div className="space-y-10">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearMessages();
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
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="h-14 min-w-[154px] rounded-full px-10 text-[16px] font-medium text-white"
            >
              Send OTP
            </Button>
          </div>
        </div>
      </form>
    );
  }

  if (step === 2) {
    return (
      <form className="w-full" onSubmit={handleConfirmOtp}>
        <div className="space-y-10">
          <div className="space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value);
                clearMessages();
                if (fieldErrors.otp) {
                  setFieldErrors((prev) => ({ ...prev, otp: "" }));
                }
              }}
              className="h-12 rounded-2xl border-[#dedede] bg-white px-4 text-[15px] shadow-none placeholder:text-[#b8b8b8]"
            />
            {fieldErrors.otp ? (
              <p className="text-[12px] font-medium text-[#ff4d4f]">
                {fieldErrors.otp}
              </p>
            ) : null}
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="h-14 min-w-[154px] rounded-full px-10 text-[16px] font-medium text-white"
            >
              Confirm OTP
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form className="w-full" onSubmit={handleUpdatePassword}>
      <div className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearMessages();
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
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#9a9a9a] transition-colors hover:text-[#6f6f6f]"
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
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="confirm password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  clearMessages();
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                  }
                }}
                className="h-12 rounded-2xl border-[#dedede] bg-white px-4 pr-10 text-[15px] shadow-none placeholder:text-[#b8b8b8]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#9a9a9a] transition-colors hover:text-[#6f6f6f]"
              >
                {showConfirmPassword ? (
                  <IoMdEyeOff className="size-4" />
                ) : (
                  <IoMdEye className="size-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="text-[12px] font-medium text-[#ff4d4f]">
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          {renderAlert()}
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="h-14 min-w-[154px] rounded-full px-10 text-[16px] font-medium text-white"
          >
            Update
          </Button>
        </div>
      </div>
    </form>
  );
}
