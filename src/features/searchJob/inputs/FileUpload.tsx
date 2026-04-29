import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { File, FileImage, FileText, Upload } from "lucide-react";
import { useCallback, useId } from "react";
import { CgClose } from "react-icons/cg";

function getFileIcon(file: File): {
  Icon: typeof FileText;
  className?: string;
} {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext))
    return { Icon: FileText, className: "text-destructive text-red-500" };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return { Icon: FileImage, className: "text-primary text-emerald-600" };
  return { Icon: File, className: "text-muted-foreground text-blue-600" };
}

export function FileUpload({
  label,
  hint,
  accept,
  maxMb,
  file,
  onFileChange,
  id,
  required = false,
}: {
  label: string;
  hint: string;
  accept: string;
  maxMb: number;
  file: File | null;
  onFileChange: (f: File | null) => void;
  id: string;
  required?: boolean;
}) {
  const inputId = useId();
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) {
        onFileChange(null);
        return;
      }
      if (f.size > maxMb * 1024 * 1024) {
        return; // TODO: toast or inline error
      }
      onFileChange(f);
    },
    [maxMb, onFileChange],
  );
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {file ? (
        <div className="flex items-center gap-2 p-4 rounded-lg border border-input bg-muted/30">
          {(() => {
            const { Icon, className } = getFileIcon(file);
            return <Icon className={cn("size-5 shrink-0", className)} />;
          })()}
          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Remove file"
          >
            <CgClose className="size-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dotted border-input bg-background px-4 py-4 transition-colors hover:bg-muted/30"
        >
          <input
            id={inputId}
            type="file"
            accept={accept}
            onChange={onInputChange}
            className="sr-only"
          />
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 text-left">
            <span className="text-sm font-medium text-foreground">
              Upload File
            </span>
            <span className="text-xs text-muted-foreground">
              {accept} Only Max Size {maxMb} MB
            </span>
          </div>
        </label>
      )}
    </div>
  );
}
