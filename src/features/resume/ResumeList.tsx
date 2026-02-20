import { ResumeCard } from "@/features/resume/ResumeCard";
import type { ResumeListItem } from "@/types/resumeType";

type ResumeListProps = {
  resumes?: ResumeListItem[];
  onOpen?: (resume: ResumeListItem) => void;
  onEdit?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  getPreviewUrl?: (id: string) => string | null;
};

export function ResumeList({
  resumes = [],
  onOpen,
  onEdit,
  onDownload,
  onDelete,
  getPreviewUrl,
}: ResumeListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 px-4">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onOpen={onOpen}
          onEdit={onEdit}
          onDownload={onDownload}
          onDelete={onDelete}
          previewUrl={getPreviewUrl?.(resume.id)}
        />
      ))}
    </div>
  );
}
