import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ResumeList } from "@/features/resume/ResumeList";
import { ViewResumeDialog } from "@/features/resume/dialogs/ViewResumeDialog";
import type { ResumeCreateProps, ResumeListItem } from "@/types/resumeType";
import { initialResume } from "@/types/resumeType";
import { HiOutlinePlus } from "react-icons/hi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImportResumeDialog } from "@/features/resume/dialogs/ImportResumeDialog";

/** Build full resume data for view dialog. Replace with API fetch when available. */
function getResumeDataForView(item: ResumeListItem): ResumeCreateProps {
  return {
    ...initialResume,
    id: item.id,
    name: item.name,
    create_date: item.create_date,
    data: {
      ...initialResume.data,
      phone: "062-XXX-XXXX",
      phone_region: 66,
      email: "xxxx.xxdsxdsxdsxsdxdsxsdxsdx@gmail.com",
      contact: [
        {
          label: "linkedIn",
          link: "www.linkedin.com/in/nut-somwang-598a18292",
        },
      ],
      skills: Array.from({ length: 10 }, (_, i) => ({
        id: `skill-${i}`,
        name: "React",
      })),
      address: {
        ...initialResume.data.address,
        address_line: "xxxx.xxdsxdsxdsxsdxdsxsdxsdx@gmail.com",
      },
      education: [
        {
          school_name: "School Name",
          logo: "",
          degree: "Associate's degree",
          field_of_study: "Computer Science",
          start_date: "2022-03-01",
          end_date: "2026-09-01",
          gpax: 0,
        },
        {
          school_name: "School Name",
          logo: "",
          degree: "Associate's degree",
          field_of_study: "Computer Science",
          start_date: "2022-03-01",
          end_date: "2026-09-01",
          gpax: 0,
        },
      ],
    },
  };
}

// Mock data for layout – replace with real API later
const MOCK_RESUMES: ResumeListItem[] = [
  {
    id: "1",
    name: "Resume 23 Aug 2025 15:56",
    create_date: "2025-08-23T15:56:00",
  },
  {
    id: "2",
    name: "Resume 23 Aug 2025 15:56",
    create_date: "2025-08-23T15:56:00",
  },
  {
    id: "3",
    name: "Resume 23 Aug 2025 15:56",
    create_date: "2025-08-23T15:56:00",
  },
  {
    id: "4",
    name: "Resume 23 Aug 2025 15:56",
    create_date: "2025-08-23T15:56:00",
  },
  {
    id: "5",
    name: "Resume 23 Aug 2025 15:56",
    create_date: "2025-08-23T15:56:00",
  },
  {
    id: "6",
    name: "Resume 23 Aug 2025 15:56",
    create_date: "2025-08-23T15:56:00",
  },
  {
    id: "7",
    name: "Resume 23 Aug 2025 15:56",
    create_date: "2025-08-23T15:56:00",
  },
  {
    id: "8",
    name: "Resume 23 Aug 2025 15:56",
    create_date: "2025-08-23T15:56:00",
  },
];

export default function ResumePage() {
  const navigate = useNavigate();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(
    null,
  );

  const handleOpenResume = (resume: ResumeListItem) => {
    setSelectedResume(resume);
    setViewDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    navigate(`/resume/create?id=${id}`);
  };

  const handleFilesSelected = (files: File[]) => {
    // TODO: upload to API / add to system
    console.log("Import files", files);
  };

  const viewResumeData =
    selectedResume != null ? getResumeDataForView(selectedResume) : null;

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
        resumeData={viewResumeData}
        resumeItem={selectedResume}
        templateId={1}
        onEdit={handleEdit}
        onDownload={(id) => console.log("Download", id)}
        onDelete={(id) => console.log("Delete", id)}
      />
      <div className="px-4 py-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Resume
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              Import Resume/CV
            </Button>
            <Button onClick={() => navigate("/resume/create")}>
              <HiOutlinePlus className="size-4" />
              New Resume
            </Button>
          </div>
        </header>
        <div className="space-y-6">
          <ResumeList
            resumes={MOCK_RESUMES}
            onOpen={handleOpenResume}
            onEdit={handleEdit}
            onDownload={(id) => console.log("Download", id)}
            onDelete={(id) => console.log("Delete", id)}
          />
        </div>
      </div>
    </PageLayout>
  );
}
