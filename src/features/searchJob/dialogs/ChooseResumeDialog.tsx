import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { ResumeListItem } from "@/types/resumeType";
import { CgClose } from "react-icons/cg";

type View = "choose" | "list";

const resumeThumbModules = import.meta.glob("/src/assets/resume-thumb/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const colorByIndex: Record<number, string> = {
  0: "blue",
  1: "red",
  2: "green",
  3: "pink",
  4: "or",
};

const resolveThemePreviewUrl = (theme?: number, color?: number) => {
  const resolvedTheme = theme && theme >= 1 && theme <= 3 ? theme : 1;
  const resolvedColor = colorByIndex[color ?? 0] ?? "blue";
  const thumbPath = `/src/assets/resume-thumb/thumb-${resolvedColor}-${resolvedTheme}.png`;

  return resumeThumbModules[thumbPath] ?? null;
};

const pdfThumbUrl =
  resumeThumbModules["/src/assets/resume-thumb/pdf-thumb.png"] ?? null;

export function ChooseResumeDialog({
  open,
  onOpenChange,
  onSelectFromDevice,
  onSelectFromJobby,
  resumesInJobby = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFromDevice: () => void;
  onSelectFromJobby: (resumeId: string) => void;
  resumesInJobby?: ResumeListItem[];
}) {
  const [view, setView] = useState<View>("choose");

  useEffect(() => {
    if (open) setView("choose");
  }, [open]);

  const handleClose = (next: boolean) => {
    if (!next) setView("choose");
    onOpenChange(next);
  };

  const handleFromDevice = () => {
    handleClose(false);
    onSelectFromDevice();
  };

  const handleFromJobby = () => {
    setView("list");
  };

  const handleSelectResume = (id: string) => {
    onSelectFromJobby(id);
    handleClose(false);
    setView("choose");
  };

  const handleBack = () => setView("choose");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-4 sm:max-w-md">
        <div className="flex items-center justify-between gap-4">
          {view === "choose" ? (
            <DialogTitle className="text-lg">Choose File</DialogTitle>
          ) : (
            <DialogTitle className="text-lg">Resume in Jobby</DialogTitle>
          )}
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close">
              <CgClose className="size-5" />
            </Button>
          </DialogClose>
        </div>

        {view === "choose" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleFromDevice}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-input bg-background p-6",
                "transition-colors hover:bg-muted/50 hover:border-muted-foreground/30",
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <span className="text-sm">From Device</span>
              <span className="text-xs text-muted-foreground">
                pdf, png, jpeg
              </span>
            </button>
            <button
              type="button"
              onClick={handleFromJobby}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-input bg-background p-6",
                "transition-colors hover:bg-muted/50 hover:border-muted-foreground/30",
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <span className="text-sm">From Jobby</span>
            </button>
          </div>
        )}

        {view === "list" && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {resumesInJobby.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No resumes in Jobby yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {resumesInJobby.map((resume) => (
                  <li key={resume.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectResume(resume.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left",
                        "transition-colors hover:bg-muted/50 hover:border-input cursor-pointer",
                      )}
                    >
                      {(() => {
                        const themePreviewUrl = resolveThemePreviewUrl(
                          resume.theme,
                          resume.color,
                        );
                        const cardPreviewUrl = resume.resume_file
                          ? pdfThumbUrl
                          : (themePreviewUrl ?? pdfThumbUrl);

                        return (
                          <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {cardPreviewUrl ? (
                              <img
                                src={cardPreviewUrl}
                                alt=""
                                className="h-full w-full object-cover object-top"
                              />
                            ) : (
                              <div className="size-full bg-neutral-200" />
                            )}
                          </div>
                        );
                      })()}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {resume.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Create At: {resume.create_date}
                        </p>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <DialogFooter>
              <div className="flex-1 mt-2">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
