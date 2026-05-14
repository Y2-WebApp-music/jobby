import { Separator } from "@/components/ui/separator";
import type {
  AdditionFile,
  AdditionFilePayload,
  AdditionQuestions,
  ApplyContactForm,
  QuestionsAnswer,
} from "@/types/searchJob";
import type { ResumeListItem } from "@/types/resumeType";

export function ReviewStep({
  contact,
  questions,
  answers,
  list_addition_file,
  addition_file,
  resumesInJobby = [],
}: {
  contact: ApplyContactForm;
  questions: AdditionQuestions[] | undefined;
  answers?: QuestionsAnswer[] | undefined;
  list_addition_file?: AdditionFile[] | undefined;
  addition_file?: AdditionFilePayload[] | undefined;
  resumesInJobby?: ResumeListItem[];
}) {
  const hasQuestions = Boolean(questions?.length);
  const hasAdditionFiles = Boolean(list_addition_file?.length);
  const resumeFromJobby = contact.resume_id
    ? resumesInJobby.find((r) => r.id === contact.resume_id)
    : null;
  const resumeDisplay = contact.resume_id
    ? (resumeFromJobby?.name ?? "Resume from Jobby")
    : (contact.resume_file?.name ?? "—");
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base mb-2">Contact Info</h3>
        <div className="mt-2 space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            {contact.email || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Phone:</span>{" "}
            {contact.phone || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Resume:</span>{" "}
            {resumeDisplay}
          </p>
          <p>
            <span className="text-muted-foreground">Cover letter:</span>{" "}
            {contact.cover_letter?.name ?? "—"}
          </p>
        </div>
      </div>
      {hasQuestions ? (
        <>
          <Separator />
          <div>
            <h3 className="text-base mb-2">Addition Question</h3>
            <div className="mt-1 space-y-3">
              {questions?.map((q) => {
                const answer = answers?.find((a) => a.id === q.id);
                let display = "—";
                if (q.type === 3) {
                  display = answer?.open_answer ?? "—";
                } else {
                  const value = answer?.value;
                  display =
                    value == null
                      ? "—"
                      : Array.isArray(value)
                        ? value
                            .map(
                              (id) =>
                                q.options?.find((o) => o.id === id)?.label ??
                                id,
                            )
                            .join(", ")
                        : (q.options?.find((o) => o.id === value)?.label ??
                          String(value));
                }
                return (
                  <div key={q.id}>
                    <p className="text-sm text-muted-foreground">{`${q.id}. ${q.question}`}</p>
                    <p
                      className={`mt-0.5 text-sm ${q.type === 3 ? "whitespace-pre-line" : ""}`}
                    >
                      {display}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
      {hasAdditionFiles ? (
        <>
          <Separator />
          <div>
            <h3 className="text-base mb-2">Addition File</h3>
            <div className="mt-1 space-y-3">
              {list_addition_file?.map((item, index) => {
                const file = addition_file?.find((f) => f.id === item.id)?.data;
                return (
                  <div key={item.id}>
                    <p className="text-sm text-muted-foreground">{`${index + 1}. ${item.label}`}</p>
                    <p className="mt-0.5 text-sm">{file?.name ?? "—"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
