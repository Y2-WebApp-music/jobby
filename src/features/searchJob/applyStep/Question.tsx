import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { AdditionQuestions, QuestionsAnswer } from "@/types/searchJob";
import { useCallback } from "react";

export function QuestionStep({
  questions,
  answers,
  setAnswers,
}: {
  questions: AdditionQuestions[];
  answers: QuestionsAnswer[];
  setAnswers: React.Dispatch<React.SetStateAction<QuestionsAnswer[]>>;
}) {
  const setAnswer = useCallback(
    (
      questionId: number,
      type: number,
      value: number | number[],
      open_answer?: string,
    ) => {
      setAnswers((prev) => {
        const i = prev.findIndex((a) => a.id === questionId);
        const entry = { id: questionId, type, value, open_answer };
        if (i >= 0) {
          const next = [...prev];
          next[i] = entry;
          return next;
        }
        return [...prev, entry];
      });
    },
    [setAnswers],
  );
  const getAnswer = useCallback(
    (questionId: number): number | number[] | undefined => {
      return answers.find((a) => a.id === questionId)?.value;
    },
    [answers],
  );
  const getOpenAnswer = useCallback(
    (questionId: number): string => {
      return answers.find((a) => a.id === questionId)?.open_answer ?? "";
    },
    [answers],
  );

  return (
    <div className="space-y-6">
      <h3 className="text-base mb-2">Question</h3>
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="space-y-3">
            <p className="text-sm">
              {`${q.id}. ${q.question}`}{" "}
              <span className="text-destructive">*</span>
            </p>
            {q.type === 1 && q.options && (
              <RadioGroup
                value={getAnswer(q.id) != null ? String(getAnswer(q.id)) : ""}
                onValueChange={(v) =>
                  setAnswer(
                    q.id,
                    q.type,
                    q.options.find((o) => String(o.id) === v)?.id ?? 0,
                  )
                }
                className="flex flex-col gap-2"
              >
                {q.options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <RadioGroupItem value={String(opt.id)} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
            {q.type === 2 && q.options && (
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const current =
                    (getAnswer(q.id) as number[] | undefined) ?? [];
                  const checked = current.includes(opt.id);
                  const maxSelect = q.max_select ?? q.options?.length ?? 0;
                  const toggle = () => {
                    let next: number[];
                    if (checked) next = current.filter((id) => id !== opt.id);
                    else
                      next =
                        current.length >= maxSelect
                          ? [...current.slice(1), opt.id]
                          : [...current, opt.id];
                    setAnswer(q.id, q.type, next);
                  };
                  return (
                    <label
                      key={opt.id}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={toggle}
                        aria-label={opt.label}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  );
                })}
                {q.max_select != null && (
                  <p className="text-xs text-muted-foreground">
                    Select up to {q.max_select}
                  </p>
                )}
              </div>
            )}
            {q.type === 3 && (
              <Textarea
                placeholder="Type your message here"
                value={getOpenAnswer(q.id)}
                onChange={(e) => setAnswer(q.id, q.type, 0, e.target.value)}
                className="min-h-24"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
