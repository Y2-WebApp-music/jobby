import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiFileText, FiSearch } from "react-icons/fi";

export default function LandingPage() {
  const features = [
    {
      title: "Smart Job Matching",
      description:
        "Discover positions aligned with your skills and preferred work style.",
      icon: FiSearch,
    },
    {
      title: "Resume Builder",
      description:
        "Create polished resumes fast with clean templates and guided sections.",
      icon: FiFileText,
    },
    {
      title: "Track Applications",
      description:
        "Monitor every application stage and stay prepared for interviews.",
      icon: FiCheckCircle,
    },
  ];

  const steps = [
    "Create your profile and highlight your strengths.",
    "Build or upload a resume in minutes.",
    "Apply confidently and track progress in one place.",
  ];

  return (
    <PageLayout navView="auto">
      <main className="relative min-h-full overflow-hidden bg-[#fff8f3]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,142,0,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(243,53,236,0.25),transparent_32%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <section className="grid gap-10 rounded-4xl border border-[#ece6e0] bg-white/95 p-7 shadow-[0_12px_34px_rgba(15,23,42,0.08)] sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-[#fff2e0] px-3 py-1 text-[12px] font-medium text-[#bf6200] sm:text-[13px]">
                New job opportunities every day
              </p>
              <h1 className="mt-4 text-3xl leading-tight font-semibold text-[#181818] sm:text-5xl sm:leading-[1.1]">
                Find work you love and grow your career faster.
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#666666] sm:text-[17px]">
                Jobby helps you discover jobs, build a standout resume, and
                manage your application journey in one simple workspace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="h-11 rounded-full px-6 text-[15px]">
                  <Link to="/signin">
                    Get Started
                    <FiArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline_gradient"
                  className="h-11 rounded-full px-6 text-[15px]"
                >
                  <Link to="/searchjob">Browse Jobs</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-[#555555]">
                <p>
                  <span className="text-lg font-semibold text-[#1b1b1b]">
                    1,200+
                  </span>{" "}
                  active jobs
                </p>
                <p>
                  <span className="text-lg font-semibold text-[#1b1b1b]">
                    3,500+
                  </span>{" "}
                  candidates hired
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#f1e3d5] bg-linear-to-br from-[#fff5ea] to-[#fff4ff] p-6 sm:p-7">
              <h2 className="text-xl font-semibold text-[#1e1e1e] sm:text-2xl">
                Why job seekers choose Jobby
              </h2>
              <ul className="mt-5 space-y-4">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <li
                      key={feature.title}
                      className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3"
                    >
                      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-main to-second text-white">
                        <Icon className="size-4.5" />
                      </span>
                      <div>
                        <p className="text-[15px] font-medium text-[#202020]">
                          {feature.title}
                        </p>
                        <p className="mt-0.5 text-[13px] text-[#6d6d6d]">
                          {feature.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step}
                className="rounded-3xl border border-[#ececec] bg-white px-5 py-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#fff0df] text-sm font-semibold text-[#cb6700]">
                  {index + 1}
                </span>
                <p className="mt-4 text-[15px] leading-relaxed text-[#353535]">
                  {step}
                </p>
              </article>
            ))}
          </section>

          <section className="rounded-4xl bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] px-6 py-10 text-white sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  Ready for your next opportunity?
                </h2>
                <p className="mt-2 text-[15px] text-white/85">
                  Join Jobby and start applying to roles that match your goals.
                </p>
              </div>
              <Button
                asChild
                variant="secondary"
                className="h-11 rounded-full bg-white px-6 text-[15px] font-semibold text-[#211f1f] hover:bg-white/90"
              >
                <Link to="/signin">Create Account</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  );
}
