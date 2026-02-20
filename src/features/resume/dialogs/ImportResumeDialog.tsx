import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FaFileAlt } from "react-icons/fa";

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png";

export type ImportResumeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesSelected?: (files: File[]) => void;
};

export function ImportResumeDialog({
  open,
  onOpenChange,
  onFilesSelected,
}: ImportResumeDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filterAcceptedFiles = (files: FileList | null): File[] => {
    if (!files?.length) return [];
    return Array.from(files).filter((file) => {
      const ok =
        file.type === "application/pdf" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png";
      return ok;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = filterAcceptedFiles(e.target.files);
    if (chosen.length) {
      onFilesSelected?.(chosen);
      onOpenChange(false);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = filterAcceptedFiles(e.dataTransfer.files);
    if (dropped.length) {
      onFilesSelected?.(dropped);
      onOpenChange(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="default"
        className="sm:max-w-lg"
        aria-describedby={undefined}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-xl font-medium text-foreground">
              Import Resume/CV
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              PDF, JPEG or PNG
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="secondary" className="size-9" aria-label="Close">
              <CgClose className="size-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div
        // className={cn("rounded-xl border border-dashed border-neutral-200 hover border-dashed-primary ")}
        >
          <div
            role="button"
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleUploadClick();
              }
            }}
            className={cn(
              "flex min-h-[200px] cursor-pointer border border-dashed border-neutral-200 hover:border-dashed hover:border-main flex-col items-center justify-center gap-3 rounded-xl bg-neutral-50 p-8 transition-colors hover:bg-neutral-100",
              "focus-visible:outline-2 focus-visible:outline-main focus-visible:outline-offset-2",
              isDragging && "bg-neutral-100",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              className="sr-only"
              onChange={handleInputChange}
              aria-label="Upload resume file"
            />
            <FaFileAlt className="size-8 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              Drag and drop files here or upload a file (PDF, JPEG or PNG)
            </p>
            <span className="font-semibold text-muted-foreground">Upload</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
