import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ResumeList } from "@/features/resume/ResumeList";
import { ImportResumeDialog } from "@/features/resume/dialogs/ImportResumeDialog";
import { ViewResumeDialog } from "@/features/resume/dialogs/ViewResumeDialog";
import resumeService, {
  mapResumeDetailToResumeForm,
} from "@/services/resumeService";
import { useAuthStore } from "@/store/auth";
import type { ResumeCreateProps, ResumeListItem } from "@/types/resumeType";
import { useCallback, useEffect, useState } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export default function ResumePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(
    null,
  );
  const [selectedResumeDetail, setSelectedResumeDetail] =
    useState<ResumeCreateProps | null>(null);
  const [loadingSelectedResume, setLoadingSelectedResume] = useState(false);

  const handleEdit = (id: string) => {
    navigate(`/resume/create?id=${id}`);
  };

  const loadResumes = useCallback(async () => {
    if (!user?.id) {
      setResumes([]);
      setLoadingResumes(false);
      return;
    }

    setLoadingResumes(true);

    try {
      const response = await resumeService.getUserResumeList(user.id);
      setResumes(response.data);
    } catch {
      setResumes([]);
      toast.error("Failed to load resumes");
    } finally {
      setLoadingResumes(false);
    }
  }, [user?.id]);

  const handleOpenResume = useCallback(async (resume: ResumeListItem) => {
    setSelectedResume(resume);
    setSelectedResumeDetail(null);
    setLoadingSelectedResume(true);
    setViewDialogOpen(true);

    try {
      const response = await resumeService.getResumeDetail(resume.id);
      setSelectedResumeDetail(mapResumeDetailToResumeForm(response.data));
    } catch {
      toast.error("Failed to load resume detail");
    } finally {
      setLoadingSelectedResume(false);
    }
  }, []);

  const handleDownloadResume = useCallback(async (resumeId: string) => {
    try {
      const result = await resumeService.exportResume(resumeId);
      downloadBlob(result.blob, result.filename);
    } catch {
      toast.error("Failed to export resume");
    }
  }, []);

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      if (!user?.id) {
        toast.error("Please sign in before importing a resume");
        return;
      }

      setUploadingResume(true);
      try {
        await resumeService.uploadUserResumeFile(user.id, file);
        toast.success("Resume uploaded successfully");
        await loadResumes();
      } catch {
        toast.error("Failed to upload resume");
      } finally {
        setUploadingResume(false);
      }
    },
    [loadResumes, user?.id],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (cancelled) return;
      await loadResumes();
    })();

    return () => {
      cancelled = true;
    };
  }, [loadResumes]);

  return (
    <PageLayout>
      <ImportResumeDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onFilesSelected={handleFilesSelected}
      />
      <ViewResumeDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        loading={loadingSelectedResume}
        resumeData={selectedResumeDetail}
        resumeItem={selectedResume}
        templateId={selectedResumeDetail?.theme ?? 1}
        onEdit={handleEdit}
        onDownload={handleDownloadResume}
        onDelete={(id) => console.log("Delete", id)}
      />
      <div className="px-4 py-6">
        <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Resume
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              disabled={uploadingResume}
            >
              {uploadingResume ? "Uploading..." : "Import Resume/CV"}
            </Button>
            <Button onClick={() => navigate("/resume/create")}>
              <HiOutlinePlus className="size-4" />
              New Resume
            </Button>
          </div>
        </header>
        <div className="space-y-6">
          {loadingResumes ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">
              Loading resumes...
            </div>
          ) : resumes.length > 0 ? (
            <ResumeList
              resumes={resumes}
              onOpen={handleOpenResume}
              onEdit={handleEdit}
              onDownload={handleDownloadResume}
              onDelete={(id) => console.log("Delete", id)}
            />
          ) : (
            <div className="px-4 py-8 text-sm text-muted-foreground">
              No resumes yet.
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
