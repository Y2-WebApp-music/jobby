import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResumeCreateProps } from "@/types/resumeType";
import { useEffect, useRef, useState } from "react";
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { EducationTab } from "./tabs/EducationTab";
import { ExperienceTab } from "./tabs/ExperienceTab";
import { OtherTab } from "./tabs/OtherTab";

type Props = {
  resume: ResumeCreateProps;
  updateData: (
    key: keyof ResumeCreateProps["data"],
    value: ResumeCreateProps["data"][keyof ResumeCreateProps["data"]],
  ) => void;
  updateAddress: (
    key: keyof ResumeCreateProps["data"]["address"],
    value: string | number,
  ) => void;
};

export default function FormInput({
  resume,
  updateData,
  updateAddress,
}: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const logo = resume.data.logo;
    if (!logo) {
      setLogoPreview(null);
      return;
    }
    if (typeof logo === "string") {
      setLogoPreview(logo);
      return;
    }
    const url = URL.createObjectURL(logo);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [resume.data.logo]);

  return (
    <Tabs defaultValue="basic" className="w-full">
      <div className="rounded-xl border border-neutral-200 bg-white p-0 shadow-sm">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-1 rounded-2xl border border-neutral-200 bg-white p-5 max-h-[calc(100vh-100px)] overflow-y-auto">
        <TabsContent value="basic" className="mt-0">
          <BasicInfoTab
            resume={resume}
            updateData={updateData}
            updateAddress={updateAddress}
            logoInputRef={logoInputRef}
            logoPreview={logoPreview}
          />
        </TabsContent>

        <TabsContent value="education" className="mt-0">
          <EducationTab
            resume={resume}
            updateData={updateData}
            updateAddress={updateAddress}
          />
        </TabsContent>

        <TabsContent value="experience" className="mt-0">
          <ExperienceTab
            resume={resume}
            updateData={updateData}
            updateAddress={updateAddress}
          />
        </TabsContent>

        <TabsContent value="other" className="mt-0">
          <OtherTab
            resume={resume}
            updateData={updateData}
            updateAddress={updateAddress}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
