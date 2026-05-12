import { CgClose } from "react-icons/cg";
import { Button } from "@/components/ui/button";

type ExamResultVariant = "passed" | "failed";

interface ExamResultDialogProps {
  open: boolean;
  skillName: string | null;
  variant: ExamResultVariant;
  onClose: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

const resultCopy: Record<
  ExamResultVariant,
  {
    heading: string;
    headingClassName: string;
    description: string;
    primaryLabel: string;
    secondaryLabel?: string;
  }
> = {
  passed: {
    heading: "passed",
    headingClassName: "text-[#00b050]",
    description: "This Skill will add to your Profile",
    primaryLabel: "Continue",
  },
  failed: {
    heading: "Failed",
    headingClassName: "text-[#ea1d2c]",
    description: "Take the Exam again to add this Skill",
    primaryLabel: "Re-take",
    secondaryLabel: "Close",
  },
};

export default function ExamResultDialog({
  open,
  skillName,
  variant,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}: ExamResultDialogProps) {
  if (!open) return null;

  const copy = resultCopy[variant];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4">
      <div className="w-full max-w-[620px] rounded-[28px] bg-white px-6 py-5 shadow-2xl sm:px-10 sm:py-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close exam result dialog"
            className="rounded-full bg-[#f3f3f3] p-2 text-black transition-colors hover:bg-[#e9e9e9]"
          >
            <CgClose className="h-7 w-7" />
          </button>
        </div>

        <div className="pb-4 text-center sm:pb-8">
          <p className="text-[18px] text-[#1f1f1f]">
            Skill : {skillName || "Unknown"}
          </p>
          <h2
            className={`mt-1 text-[38px] font-medium ${copy.headingClassName}`}
          >
            {copy.heading}
          </h2>
          <p className="mt-4 text-[17px] text-[#767676]">{copy.description}</p>

          <div className="mt-10 flex items-center justify-center gap-3">
            {copy.secondaryLabel ? (
              <button
                type="button"
                onClick={onSecondaryAction ?? onClose}
                className="rounded-full border border-[#d8d8d8] px-5 py-2 text-[16px] font-medium text-[#767676] transition hover:bg-[#f8f8f8]"
              >
                {copy.secondaryLabel}
              </button>
            ) : null}

            <Button
              type="button"
              onClick={onPrimaryAction}
              className="h-12 rounded-full px-8 text-[17px] font-medium text-white"
            >
              {copy.primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
