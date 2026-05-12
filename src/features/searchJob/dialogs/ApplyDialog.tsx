import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ResumeListItem } from "@/types/resumeType";
import {
  initialApplyPayload,
  type AdditionQuestions,
  type ApplyDialogJob,
  type ApplyPayload,
} from "@/types/searchJob";
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { CgClose } from "react-icons/cg";
import { toast } from "sonner";
import { FileUploadStep } from "../applyStep/AdditionFile";
import { ContactStep } from "../applyStep/Contact";
import { QuestionStep } from "../applyStep/Question";
import { ReviewStep } from "../applyStep/review";

export type ApplyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applyDetail: ApplyDialogJob;
  questions?: AdditionQuestions[];
  applyData: ApplyPayload | null;
  setApplyData: Dispatch<SetStateAction<ApplyPayload>>;
  resumesInJobby?: ResumeListItem[];
  onApply?: () => void | Promise<void>;
};

function getSteps(
  applyDetail: ApplyDialogJob,
): { id: string; label: string }[] {
  const steps: { id: string; label: string }[] = [
    { id: "contact", label: "Contact" },
  ];
  if (
    applyDetail.addition_questions &&
    applyDetail.addition_questions.length > 0
  ) {
    steps.push({ id: "question", label: "Question" });
  }
  if (applyDetail.addition_file && applyDetail.addition_file.length > 0) {
    steps.push({ id: "file", label: "Addition File" });
  }
  steps.push({ id: "review", label: "Review" });
  return steps;
}

function isContactStepValid(
  applyData: ApplyPayload | null,
  applyDetail: ApplyDialogJob,
): boolean {
  if (!applyData) return false;
  const emailOk = applyData.email.trim() !== "";
  const phoneOk = applyData.phone.trim() !== "";
  const resumeOk =
    applyData.resume_id.trim() !== "" || applyData.resume_file !== null;
  const coverOk =
    !applyDetail.has_cover_letter || applyData.cover_letter !== null;
  return emailOk && phoneOk && resumeOk && coverOk;
}

function isQuestionStepValid(
  applyData: ApplyPayload | null,
  applyDetail: ApplyDialogJob,
): boolean {
  const questions = applyDetail.addition_questions ?? [];
  if (!applyData || questions.length === 0) return questions.length === 0;
  const answers = applyData.questions;
  for (const q of questions) {
    const a = answers.find((x) => x.id === q.id);
    if (!a) return false;
    if (q.type === 1 && typeof a.value !== "number") return false;
    if (q.type === 2 && (!Array.isArray(a.value) || a.value.length === 0)) {
      return false;
    }
    if (q.type === 3) {
      const text = (a.open_answer ?? "").trim();
      if (text === "") return false;
    }
  }
  return true;
}

function isStepValid(
  stepId: string,
  applyData: ApplyPayload | null,
  applyDetail: ApplyDialogJob,
): boolean {
  switch (stepId) {
    case "contact":
      return isContactStepValid(applyData, applyDetail);
    case "question":
      return isQuestionStepValid(applyData, applyDetail);
    case "file":
      return true; // Addition File not required
    case "review":
      return true;
    default:
      return false;
  }
}

/** Step i is reachable (can navigate to it) if all previous steps are valid */
function canGoToStep(
  stepIndex: number,
  currentStep: number,
  steps: readonly { id: string; label: string }[],
  applyData: ApplyPayload | null,
  applyDetail: ApplyDialogJob,
): boolean {
  if (stepIndex <= currentStep) return true; // can always go back
  for (let s = 0; s < stepIndex; s++) {
    if (!isStepValid(steps[s].id, applyData, applyDetail)) return false;
  }
  return true;
}

function StepIndicator({
  currentStep,
  steps,
  setStep,
  applyData,
  applyDetail,
}: {
  currentStep: number;
  steps: readonly { id: string; label: string }[];
  setStep: (step: number) => void;
  applyData: ApplyPayload | null;
  applyDetail: ApplyDialogJob;
}) {
  return (
    <div className="w-full">
      <div className="flex gap-1 text-sm">
        {steps.map((step, i) => {
          const disabled = !canGoToStep(
            i,
            currentStep,
            steps,
            applyData,
            applyDetail,
          );
          return (
            <button
              type="button"
              onClick={() => !disabled && setStep(i)}
              key={step.id}
              disabled={disabled}
              className={cn(
                "flex-1 text-center text-base font-normal transition-colors",
                disabled && "cursor-not-allowed opacity-60",
                !disabled && "hover:cursor-pointer",
                i <= currentStep
                  ? i === currentStep
                    ? "bg-linear-to-r from-main to-second bg-clip-text text-transparent"
                    : "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {step.label}
            </button>
          );
        })}
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-linear-to-r from-main to-second transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function ApplyDialog({
  open,
  onOpenChange,
  applyDetail,
  applyData,
  setApplyData,
  resumesInJobby,
  onApply,
}: ApplyDialogProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const steps = useMemo(() => getSteps(applyDetail), [applyDetail]);
  const lastStepIndex = steps.length - 1;
  const effectiveStep = Math.min(step, lastStepIndex);
  const stepId = steps[effectiveStep]?.id ?? "contact";

  const resetForm = useCallback(() => {
    setStep(0);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetForm();
      onOpenChange(next);
    },
    [onOpenChange, resetForm],
  );

  const handleNext = () => {
    if (effectiveStep < lastStepIndex) setStep((s) => s + 1);
  };
  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };
  const handleApply = async () => {
    if (onApply) {
      setSubmitting(true);
      try {
        await onApply();
        handleOpenChange(false);
        toast.success("Application submitted successfully");
        setApplyData(initialApplyPayload);
      } catch (err) {
        handleOpenChange(true);
        toast.error("Failed to submit application. Please try again.");
      } finally {
        setSubmitting(false);
      }
    } else {
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-4 overflow-hidden sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-lg">
              Apply to {applyDetail.company_name}
            </DialogTitle>
            <DialogDescription>{applyDetail.job_title}</DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={() => {
                setApplyData(initialApplyPayload);
              }}
            >
              <CgClose className="size-5" />
            </Button>
          </DialogClose>
        </div>
        <StepIndicator
          currentStep={effectiveStep}
          steps={steps}
          setStep={setStep}
          applyData={applyData}
          applyDetail={applyDetail}
        />
        <div className="min-h-0 flex-1 overflow-y-auto p-2 max-h-[calc(70vh-100px)]">
          {stepId === "contact" && (
            <ContactStep
              contact={{
                first_name: applyDetail?.first_name ?? "",
                last_name: applyDetail?.last_name ?? "",
                logo: applyDetail?.logo ?? "",
                email: applyData?.email ?? "",
                phone: applyData?.phone ?? "",
                resume_id: applyData?.resume_id ?? "",
                resume_file: applyData?.resume_file ?? null,
                cover_letter: applyData?.cover_letter ?? null,
                has_cover_letter: applyDetail?.has_cover_letter ?? false,
              }}
              setContact={(action) =>
                setApplyData((prev) => {
                  const payload: ApplyPayload = prev ?? {
                    email: "",
                    phone: "",
                    resume_id: "",
                    resume_file: null,
                    cover_letter: null,
                    questions: [],
                    addition_file: [],
                  };
                  return typeof action === "function"
                    ? action(payload)
                    : action;
                })
              }
              resumesInJobby={resumesInJobby}
            />
          )}
          {stepId === "question" &&
            applyData?.questions &&
            applyDetail.addition_questions && (
              <QuestionStep
                questions={applyDetail.addition_questions}
                answers={applyData?.questions}
                setAnswers={(action) =>
                  setApplyData((prev) => {
                    const nextQuestions =
                      typeof action === "function"
                        ? action(prev.questions)
                        : action;
                    return { ...prev, questions: nextQuestions };
                  })
                }
              />
            )}
          {stepId === "file" &&
            applyData?.addition_file &&
            applyDetail.addition_file && (
              <FileUploadStep
                list_addition_file={applyDetail.addition_file}
                addition_file={applyData.addition_file}
                setAdditionFile={(action) =>
                  setApplyData((prev) => {
                    const nextFiles =
                      typeof action === "function"
                        ? action(prev.addition_file)
                        : action;
                    return { ...prev, addition_file: nextFiles };
                  })
                }
              />
            )}
          {stepId === "review" && (
            <ReviewStep
              contact={{
                first_name: applyDetail?.first_name ?? "",
                last_name: applyDetail?.last_name ?? "",
                logo: applyDetail?.logo ?? "",
                email: applyData?.email ?? "",
                phone: applyData?.phone ?? "",
                resume_id: applyData?.resume_id ?? "",
                resume_file: applyData?.resume_file ?? null,
                cover_letter: applyData?.cover_letter ?? null,
                has_cover_letter: applyDetail?.has_cover_letter ?? false,
              }}
              questions={applyDetail?.addition_questions}
              answers={applyData?.questions}
              list_addition_file={applyDetail?.addition_file}
              addition_file={applyData?.addition_file}
              resumesInJobby={resumesInJobby}
            />
          )}
        </div>
        <DialogFooter className="flex-row justify-between pt-2 sm:justify-between">
          <div>
            {effectiveStep > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <span />
            )}
          </div>
          <div>
            {effectiveStep < lastStepIndex ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid(stepId, applyData, applyDetail)}
              >
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleApply} disabled={submitting}>
                {submitting ? "Applying…" : "Apply"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
