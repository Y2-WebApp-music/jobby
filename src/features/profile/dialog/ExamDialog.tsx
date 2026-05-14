import { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import ExamFailedDialog from "@/features/profile/dialog/ExamFailedDialog";
import ExamPassedDialog from "@/features/profile/dialog/ExamPassedDialog";
import {
  getExam,
  submitExam,
  type ExamQuestionItem,
} from "@/services/getExamService";
import { getSearchSkill } from "@/services/searchSkillService";
import { useAuthStore } from "@/store/auth";

type ExamPhase = "intro" | "exam" | "loading" | "fetching";
type ExamResult = "passed" | "failed" | null;

interface ExamDialogProps {
  open: boolean;
  skillId?: string | null;
  skillName: string | null;
  onClose: () => void;
  onPass: (skillName: string) => void;
}

export default function ExamDialog({
  open,
  skillId = null,
  skillName,
  onClose,
  onPass,
}: ExamDialogProps) {
  const [phase, setPhase] = useState<ExamPhase>("intro");
  const [questions, setQuestions] = useState<ExamQuestionItem[]>([]);
  const [resolvedSkillId, setResolvedSkillId] = useState<string | null>(
    skillId,
  );
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<ExamResult>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!open) return;
    if (skillId) {
      setResolvedSkillId(skillId);
      return;
    }
    if (!skillName) {
      setResolvedSkillId(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await getSearchSkill(skillName);
        if (cancelled) return;
        const matched = response.data.find(
          (item) => item.name.toLowerCase() === skillName.toLowerCase(),
        );
        setResolvedSkillId(matched?.eid ?? response.data[0]?.eid ?? null);
      } catch {
        if (cancelled) return;
        setResolvedSkillId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, skillId, skillName]);

  useEffect(() => {
    if (!open || !resolvedSkillId) return;
    let cancelled = false;
    setPhase("fetching");
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    void (async () => {
      try {
        const response = await getExam(resolvedSkillId);
        if (cancelled) return;
        setQuestions(response.data ?? []);
        setPhase("intro");
      } catch {
        if (cancelled) return;
        setQuestions([]);
        setPhase("intro");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, resolvedSkillId]);

  if (!open || !resolvedSkillId) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const showResultDialog = result !== null;

  const resetAttempt = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setPhase("intro");
    setResult(null);
  };

  const handleSubmitExam = async () => {
    setPhase("loading");
    try {
      const response = await submitExam(resolvedSkillId, {
        user_id: user?.id ?? "",
        answers: questions.map((question) => ({
          id: question.id,
          selected_index: answers[question.id] ?? -1,
        })),
      });
      const nextResult: ExamResult = response.data.is_pass
        ? "passed"
        : "failed";
      setResult(nextResult);
    } catch {
      setResult("failed");
    }
  };

  return (
    <>
      {!showResultDialog ? (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
          <DialogContent
            showCloseButton={false}
            className="z-[120] min-w-[50vw] w-full max-w-[920px] rounded-[28px] bg-white p-5 shadow-2xl sm:p-7 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="bg-gradient-to-r from-main to-second bg-clip-text text-[18px] leading-none font-medium text-transparent sm:text-[40px]">
                  {skillName || "Skill Exam"}
                </h2>
                <p className="mt-2 text-sm text-[#787878]">
                  Before skill add to you, Must be Exam your knowledge
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close exam dialog"
                className="rounded-full bg-[#f3f3f3] p-2 text-black transition-colors hover:bg-[#e9e9e9]"
              >
                <CgClose className="h-7 w-7" />
              </button>
            </div>

            {phase === "intro" ? (
              <div className="mt-8">
                <p className="text-center text-lg font-normal text-black">
                  {questions.length} questions
                </p>

                <div className="mt-8 space-y-5 text-black">
                  <div>
                    <h3 className="text-[16px] font-medium">
                      Exam Description
                    </h3>
                    <p className="mt-4 text-base leading-7 text-[#2a2a2a]">
                      Answer all questions to add this skill.
                    </p>
                  </div>

                  <div className="pt-3 text-center">
                    <Button
                      type="button"
                      disabled={questions.length === 0}
                      onClick={() => setPhase("exam")}
                      className="h-12 rounded-full px-8 text-xl font-normal text-white"
                    >
                      Start Exam
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {phase === "exam" ? (
              <div className="mt-6">
                <p className="text-[14px] font-medium text-[#7b7b7b]">
                  {currentQuestionIndex + 1} of {questions.length}
                </p>

                <p className="mt-4 max-w-[760px] text-[18px] leading-7 font-medium text-black">
                  {currentQuestion?.question}
                </p>

                <div className="mt-5 space-y-2">
                  {currentQuestion?.choices.map((choice, choiceIndex) => {
                    const isSelected = selectedAnswer === choiceIndex;

                    return (
                      <button
                        key={`${currentQuestion.id}-${choice}`}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [currentQuestion.id]: choiceIndex,
                          }))
                        }
                        className="flex w-full items-start gap-3 rounded-2xl px-1 py-2 text-left"
                      >
                        <span
                          className={`mt-1 inline-flex h-5 w-5 shrink-0 rounded-full border ${
                            isSelected
                              ? "border-[#ff8c1a] shadow-[inset_0_0_0_4px_white] bg-[#ff8c1a]"
                              : "border-[#d8d8d8] bg-white"
                          }`}
                        />
                        <span className="text-[16px] leading-7 text-[#202020]">
                          {choice}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentQuestionIndex === 0}
                    className="rounded-full border border-[#d7d7d7] px-5 py-2 text-[14px] font-normal text-[#7b7b7b] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Back
                  </button>

                  <Button
                    type="button"
                    disabled={selectedAnswer === undefined}
                    onClick={() => {
                      if (isLastQuestion) {
                        void handleSubmitExam();
                        return;
                      }

                      setCurrentQuestionIndex((prev) => prev + 1);
                    }}
                    className="h-12 rounded-full px-8 text-[16px] font-normal text-white"
                  >
                    {isLastQuestion ? "Submit" : "Next"}
                  </Button>
                </div>
              </div>
            ) : null}

            {phase === "loading" ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
                <Spinner className="size-14 text-main" />
                <p className="text-[16px] font-normal text-[#6f6f6f]">
                  Checking your exam result...
                </p>
              </div>
            ) : null}

            {phase === "fetching" ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4">
                <Spinner className="size-14 text-main" />
                <p className="text-[16px] font-normal text-[#6f6f6f]">
                  Loading exam...
                </p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      ) : null}

      <ExamPassedDialog
        open={result === "passed"}
        skillName={skillName}
        onClose={onClose}
        onContinue={() => {
          if (!skillName) return;
          onPass(skillName);
        }}
      />

      <ExamFailedDialog
        open={result === "failed"}
        skillName={skillName}
        onClose={onClose}
        onRetake={resetAttempt}
      />
    </>
  );
}
