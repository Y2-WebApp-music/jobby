import { Button } from "@/components/ui/button";
import JobbyLogo from "@/assets/icons/JobbyLogologregis.svg?react";
import ForgotPassword from "@/features/authentication/ForgotPassword";
import { useState } from "react";

type ForgotPasswordStep = 1 | 2 | 3;

const stepMeta = {
  1: "Welcome Jobber",
  2: "Confirm OTP",
  3: "Enter New password",
} as const;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ForgotPasswordStep>(1);

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
                {stepMeta[step]}
              </h1>
              <ForgotPassword step={step} onStepChange={setStep} />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
