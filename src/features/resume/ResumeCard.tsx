import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ResumeListItem } from "@/types/resumeType";
import dayjs from "dayjs";
import { IoIosMore } from "react-icons/io";
import { RiPencilFill } from "react-icons/ri";
import { HiOutlineDocumentDownload } from "react-icons/hi";

type ResumeCardProps = {
  resume: ResumeListItem;
  onOpen?: (resume: ResumeListItem) => void;
  onEdit?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  previewUrl?: string | null;
  className?: string;
};

const formatResumeDate = (date: string) => {
  const d = dayjs(date);
  return d.isValid() ? d.format("DD MMM YYYY HH:mm") : date;
};

export function ResumeCard({
  resume,
  onOpen,
  onEdit,
  onDownload,
  onDelete,
  previewUrl,
  className,
}: ResumeCardProps) {
  const displayDate = formatResumeDate(resume.create_date);

  return (
    <article
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={() => onOpen?.(resume)}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(resume);
        }
      }}
      className={cn(
        "flex gap-4 rounded-xl border border-neutral-200 bg-muted/30 p-4 hover:bg-neutral-100",
        onOpen && "cursor-pointer",
        className,
      )}
    >
      {/* Preview area */}
      <div className="flex h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-base font-medium text-foreground">
            {resume.name || `Resume ${displayDate}`}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="More options"
                onClick={(e) => e.stopPropagation()}
              >
                <IoIosMore className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(resume.id);
                  }}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {onDownload && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(resume.id);
                  }}
                >
                  Download
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(resume.id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Create At: {displayDate}
        </p>
        <div className="mt-auto flex flex-wrap justify-end items-center gap-2 pt-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.(resume.id);
            }}
          >
            <HiOutlineDocumentDownload className="size-4" />
            download
          </Button>
          <Button
            variant="outline_gradient"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(resume.id);
            }}
          >
            <RiPencilFill className="size-4" />
            edit
          </Button>
        </div>
      </div>
    </article>
  );
}
