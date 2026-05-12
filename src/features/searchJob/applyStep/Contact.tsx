import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApplyContactForm, ApplyPayload } from "@/types/searchJob";
import { FileUpload } from "../inputs/FileUpload";
import { ChooseResumeDialog } from "../dialogs/ChooseResumeDialog";
import type { ResumeListItem } from "@/types/resumeType";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { cn } from "@/lib/utils";
import { FileText, Upload } from "lucide-react";
import { CgClose } from "react-icons/cg";

const RESUME_ACCEPT = ".pdf,.jpg,.jpeg,.png";
const RESUME_MAX_MB = 10;
const COVER_ACCEPT = ".doc,.docx,.txt";
const COVER_MAX_MB = 10;

export function ContactStep({
  contact,
  setContact,
  resumesInJobby = [],
}: {
  contact: ApplyContactForm;
  setContact: Dispatch<SetStateAction<ApplyPayload>>;
  resumesInJobby?: ResumeListItem[];
}) {
  const [chooseResumeOpen, setChooseResumeOpen] = useState(false);
  const resumeInputId = useId();
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const onResumeFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (f.size > RESUME_MAX_MB * 1024 * 1024) return;
      setContact((c) => ({ ...c, resume_id: "", resume_file: f }));
      e.target.value = "";
    },
    [setContact],
  );

  const clearResume = useCallback(() => {
    setContact((c) => ({ ...c, resume_id: "", resume_file: null }));
  }, [setContact]);

  const hasResume = contact.resume_id !== "" || contact.resume_file !== null;
  const resumeFromJobby = resumesInJobby.find(
    (r) => r.id === contact.resume_id,
  );
  const resumeLabel = contact.resume_id
    ? (resumeFromJobby?.name ?? "Resume from Jobby")
    : contact.resume_file?.name;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base mb-2">Contact Info</h3>
        <div className="mt-0 flex items-center gap-3">
          <div className="size-16 shrink-0 rounded-full bg-muted overflow-hidden">
            <img
              src={contact.logo as string}
              alt={`${contact.first_name} ${contact.last_name}`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-base">{`${contact.first_name} ${contact.last_name}`}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="apply-email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="apply-email"
            type="email"
            placeholder="Email"
            value={contact.email}
            onChange={(e) =>
              setContact((c) => ({ ...c, email: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apply-phone">
            Mobile phone number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="apply-phone"
            type="tel"
            placeholder="Mobile phone number"
            value={contact.phone}
            onChange={(e) =>
              setContact((c) => ({ ...c, phone: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          Resume <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Be sure to include an updated resume
        </p>
        <input
          ref={resumeInputRef}
          id={resumeInputId}
          type="file"
          accept={RESUME_ACCEPT}
          onChange={onResumeFileChange}
          className="sr-only"
        />
        {hasResume ? (
          <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/30 p-4">
            <FileText className="size-5 shrink-0 text-destructive" />
            <span className="min-w-0 flex-1 truncate text-sm">
              {resumeLabel}
            </span>
            <button
              type="button"
              onClick={clearResume}
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Remove resume"
            >
              <CgClose className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setChooseResumeOpen(true)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-dotted border-input bg-background px-4 py-4",
              "transition-colors hover:bg-muted/30",
            )}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5 text-left">
              <span className="text-sm font-medium text-foreground">
                Upload File
              </span>
              <span className="text-xs text-muted-foreground">
                {RESUME_ACCEPT.replace(/\./g, "")} Only Max Size {RESUME_MAX_MB}{" "}
                MB
              </span>
            </div>
          </button>
        )}
      </div>

      <ChooseResumeDialog
        open={chooseResumeOpen}
        onOpenChange={setChooseResumeOpen}
        onSelectFromDevice={() => resumeInputRef.current?.click()}
        onSelectFromJobby={(id) =>
          setContact((c) => ({ ...c, resume_id: id, resume_file: null }))
        }
        resumesInJobby={resumesInJobby}
      />
      <FileUpload
        id="apply-cover"
        label="Cover letter"
        hint="Be sure to include an updated cover letter"
        accept={COVER_ACCEPT}
        maxMb={COVER_MAX_MB}
        file={contact.cover_letter}
        onFileChange={(f) => setContact((c) => ({ ...c, cover_letter: f }))}
        required={contact.has_cover_letter}
      />
    </div>
  );
}
