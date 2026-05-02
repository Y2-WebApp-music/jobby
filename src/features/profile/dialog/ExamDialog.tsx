import { useEffect, useMemo, useState } from "react";
import { CgClose } from "react-icons/cg";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ExamFailedDialog from "@/features/profile/dialog/ExamFailedDialog";
import ExamPassedDialog from "@/features/profile/dialog/ExamPassedDialog";
import { shuffleExamQuestions, type ExamQuestion } from "@/types/examQuestion";
import { getSkillExam } from "@/types/skillExam";

type ExamPhase = "intro" | "exam" | "loading";
type ExamResult = "passed" | "failed" | null;

interface ExamDialogProps {
  open: boolean;
  skillName: string | null;
  onClose: () => void;
  onPass: (skillName: string) => void;
}

const buildAttempt = (skillName: string | null): ExamQuestion[] => {
  const exam = getSkillExam(skillName);
  if (!exam) return [];

  return shuffleExamQuestions(exam.questions).slice(0, exam.questionCount);
};

export default function ExamDialog({
  open,
  skillName,
  onClose,
  onPass,
}: ExamDialogProps) {
  const exam = useMemo(() => getSkillExam(skillName), [skillName]);
  const [phase, setPhase] = useState<ExamPhase>("intro");
  const [selectedQuestions, setSelectedQuestions] = useState(
    buildAttempt(skillName),
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<ExamResult>(null);

  useEffect(() => {
    if (!open || !exam) return;

    setSelectedQuestions(buildAttempt(exam.skillName));
    setAnswers({});
    setCurrentQuestionIndex(0);
    setPhase("intro");
    setResult(null);
  }, [exam, open]);

  if (!open || !exam) return null;

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const selectedAnswer =
    currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestionIndex === exam.questionCount - 1;
  const showResultDialog = result !== null;

  const resetAttempt = () => {
    setSelectedQuestions(buildAttempt(exam.skillName));
    setAnswers({});
    setCurrentQuestionIndex(0);
    setPhase("intro");
    setResult(null);
  };

  const submitExam = () => {
    const score = selectedQuestions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);

    const nextResult: ExamResult =
      score >= exam.passScore ? "passed" : "failed";

    setPhase("loading");

    window.setTimeout(() => {
      setResult(nextResult);
    }, 900);
  };

  return (
    <>
      {!showResultDialog ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4">
          <div className="w-full max-w-[920px] rounded-[28px] bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="bg-gradient-to-r from-main to-second bg-clip-text text-[20px] leading-none font-semibold text-transparent sm:text-[44px]">
                  {exam.title}
                </h2>
                <p className="mt-2 text-base text-[#787878]">
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
                <p className="text-center text-[28px] font-semibold text-black">
                  {exam.questionCount} questions
                </p>

                <div className="mt-8 space-y-5 text-black">
                  <div>
                    <h3 className="text-[18px] font-semibold">Exam Description</h3>
                    <p className="mt-4 text-lg leading-8 text-[#2a2a2a]">
                      {exam.description}
                    </p>
                  </div>

                  <div className="pt-3 text-center">
                    <Button
                      type="button"
                      onClick={() => setPhase("exam")}
                      className="h-12 rounded-full px-8 text-[22px] font-medium text-white"
                    >
                      Start Exam
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {phase === "exam" ? (
              <div className="mt-6">
                <p className="text-[16px] font-semibold text-[#7b7b7b]">
                  {currentQuestionIndex + 1} of {exam.questionCount}
                </p>

                <p className="mt-4 max-w-[760px] text-[20px] leading-8 font-semibold text-black">
                  {currentQuestion?.prompt}
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
                        <span className="text-[18px] leading-8 text-[#202020]">
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
                    className="rounded-full border border-[#d7d7d7] px-5 py-2 text-[16px] font-medium text-[#7b7b7b] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Back
                  </button>

                  <Button
                    type="button"
                    disabled={selectedAnswer === undefined}
                    onClick={() => {
                      if (isLastQuestion) {
                        submitExam();
                        return;
                      }

                      setCurrentQuestionIndex((prev) => prev + 1);
                    }}
                    className="h-12 rounded-full px-8 text-[18px] font-medium text-white"
                  >
                    {isLastQuestion ? "Submit" : "Next"}
                  </Button>
                </div>
              </div>
            ) : null}

            {phase === "loading" ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
                <Spinner className="size-14 text-main" />
                <p className="text-[18px] font-medium text-[#6f6f6f]">
                  Checking your exam result...
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <ExamPassedDialog
        open={result === "passed"}
        skillName={exam.skillName}
        onClose={onClose}
        onContinue={() => {
          onPass(exam.skillName);
        }}
      />

      <ExamFailedDialog
        open={result === "failed"}
        skillName={exam.skillName}
        onClose={onClose}
        onRetake={resetAttempt}
      />
    </>
  );
}
