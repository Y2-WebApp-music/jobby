import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ApplyDialog } from "@/features/searchJob/dialogs/ApplyDialog";
import { mockApplyDialogJob, mockResumeList } from "@/mock/searchjob";

import {
  initialApplyDialogJob,
  initialApplyPayload,
  type ApplyDialogJob,
  type ApplyPayload,
} from "@/types/searchJob";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyDetail, setApplyDetail] = useState<ApplyDialogJob>(
    initialApplyDialogJob,
  );
  const [applyData, setApplyData] = useState<ApplyPayload>(initialApplyPayload);

  const fetchApplyDetail = async () => {
    try {
      const res = mockApplyDialogJob;
      setApplyDetail(res);
      setApplyData((prev) => ({ ...prev, email: res.email, phone: res.phone }));
    } catch (err) {}
  };

  const handleApply = () => {
    try {
      console.log(" Submit .... ");
    } catch (err) {}
  };

  const handleOpenApplyDialog = () => {
    setApplyOpen(true);
    fetchApplyDetail();
  };

  useEffect(() => {
    if (applyOpen === true) {
      console.log("applyData ", applyData);
    }
  }, [applyOpen, applyData]);

  return (
    <PageLayout>
      <div className="bg-background h-full w-full py-2 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-medium">Landing Page</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores
          provident repellendus saepe laboriosam iusto recusandae dicta tempora,
          ad, quae sequi distinctio sint alias inventore consequatur explicabo a
          corporis aliquam incidunt. Perspiciatis debitis amet alias maxime
          dignissimos quam explicabo expedita pariatur. Magnam expedita tempora
          ea eos porro quam praesentium totam, vitae nesciunt nobis voluptates
          iusto itaque pariatur eligendi deleniti. Aliquid, quibusdam. Commodi
          eos, doloremque nihil dicta atque quisquam? Dolorem, perferendis!
          Consequatur sunt sit obcaecati libero dolore, hic, beatae ducimus
          culpa incidunt ipsum voluptatem. Molestias expedita nemo nam incidunt
          provident magni neque? Voluptatem corrupti molestiae, nostrum aliquam
          tempora tempore quis enim id aperiam consequatur repudiandae, deleniti
          ipsam praesentium officia corporis est a dolor, nemo aspernatur ab
          minima asperiores illo! Id, rerum expedita.
        </p>
        <p className=" text-second"> Button Test </p>

        <div className="flex gap-2 p-4">
          <Button variant="default"> Test button </Button>
          <Button variant="outline"> Test button </Button>
          <Button variant="ghost"> Test button </Button>
          <Button variant="destructive"> Test button </Button>
          <Button variant="link"> Test button </Button>
          <Button variant="secondary"> Test button </Button>
        </div>

        <div className="mt-4">
          <p>Appvly Dialog</p>
          <Button onClick={handleOpenApplyDialog}>Open Dialog</Button>
          <ApplyDialog
            open={applyOpen}
            onOpenChange={setApplyOpen}
            applyDetail={applyDetail}
            applyData={applyData}
            setApplyData={setApplyData}
            onApply={handleApply}
            resumesInJobby={mockResumeList}
          />
        </div>
      </div>
    </PageLayout>
  );
}
