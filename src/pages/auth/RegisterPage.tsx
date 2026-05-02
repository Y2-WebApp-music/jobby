import JobbyLogo from "@/assets/icons/JobbyLogologregis.svg?react";
import Register from "@/features/authentication/Register";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff8f3]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(255,142,0,0.34),transparent_28%),radial-gradient(circle_at_right_center,rgba(243,53,236,0.32),transparent_30%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="flex w-full max-w-[660px] flex-col items-center">
          <div className="mb-10 flex flex-col items-center">
            <JobbyLogo className="h-auto w-[320px] max-w-full" />
          </div>

          <section className="w-full rounded-[22px] border border-[#dddcdc] bg-white/98 px-8 py-10 shadow-[0_10px_28px_rgba(15,23,42,0.12)] sm:px-14">
            <Register />
          </section>
        </div>
      </div>
    </main>
  );
}
