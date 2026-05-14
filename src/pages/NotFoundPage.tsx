import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCompass } from "react-icons/fi";

export default function NotFoundPage() {
  return (
    <PageLayout navView="auto">
      <main className="min-h-full bg-[#fff8f3] px-4 py-10 sm:px-6 sm:py-14">
        <section className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-4xl border border-[#ece6e0] bg-white p-8 text-center shadow-[0_12px_34px_rgba(15,23,42,0.08)] sm:p-12">
          <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-linear-to-r from-main to-second text-white shadow-lg">
            <FiCompass className="size-8" />
          </span>
          <p className="mt-6 text-sm font-medium tracking-[0.2em] text-[#cb6700]">
            ERROR 404
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#181818] sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#666666] sm:text-base">
            The page you are looking for may have been moved or does not exist.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-11 rounded-full px-6 text-[15px]">
              <Link to="/">
                Go to home
                <FiArrowLeft className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline_gradient"
              className="h-11 rounded-full px-6 text-[15px]"
            >
              <Link to="/searchjob">Browse jobs</Link>
            </Button>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
