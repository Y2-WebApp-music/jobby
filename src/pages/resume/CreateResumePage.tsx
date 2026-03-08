import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { resume_color, resume_color_classes } from "@/constants/color";
import FormInput from "@/features/resume/editResume/FormInput";
import RenderResume from "@/features/resume/RenderResume";
import Template1 from "@/features/resume/resumeTemplate/template-1";
import Template2 from "@/features/resume/resumeTemplate/template-2";
import Template3 from "@/features/resume/resumeTemplate/template-3";
import { useAddressOptionStore } from "@/store/addressOption";
import { usePropertiesStore } from "@/store/properties";
import { initialResume, type ResumeCreateProps } from "@/types/resumeType";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

export default function CreateResumePage() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeCreateProps>(initialResume);
  // const [resume, setResume] = useState<ResumeCreateProps>();
  const printRef = useRef<HTMLDivElement>(null);

  const updateData = <K extends keyof ResumeCreateProps["data"]>(
    key: K,
    value: ResumeCreateProps["data"][K],
  ) => {
    setResume((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value,
      },
    }));
  };

  const updateAddress = (
    key: keyof ResumeCreateProps["data"]["address"],
    value: string | number,
  ) => {
    setResume((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        address: {
          ...prev.data.address,
          [key]: value,
        },
      },
    }));
  };

  const Template =
    resume.theme === 2 ? Template2 : resume.theme === 3 ? Template3 : Template1;

  const getPdfFileName = (data: ResumeCreateProps, template: number) => {
    const nameParts = [data.data.first_name, data.data.last_name].filter(
      Boolean,
    );
    const baseName = (nameParts.join("-") || data.name || "resume").trim();
    const safeName = baseName.replace(/[^a-z0-9-_]+/gi, "_");
    return `${safeName}-template-${template}`;
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: getPdfFileName(resume, resume.theme),
  });

  const fetchPhoneRegions = async () => {
    try {
      // usePropertiesStore.setPhoneRegions();
    } catch (err) {}
  };

  const fetchProvinces = async () => {
    try {
      // useAddressOptionStore.setProvinces();
    } catch (err) {}
  };

  const fetchDistricts = async () => {
    try {
      // useAddressOptionStore.setDistricts();
    } catch (err) {}
  };

  useEffect(() => {
    if (usePropertiesStore.getPhoneRegionOptions().length === 0) {
      fetchPhoneRegions();
    }
    fetchProvinces();
    if (resume.data.address.province_id) {
      fetchDistricts();
    }
  }, [resume]);

  useEffect(() => {
    console.log("resume ", resume);
  }, [resume]);

  useEffect(() => {
    return () => {
      useAddressOptionStore.getState().setProvinces([]);
      useAddressOptionStore.getState().setDistricts([]);
    };
  }, []);

  return (
    <PageLayout>
      <div className="p-6 font-sans">
        <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate("/resume")}>
              <IoIosArrowBack className="size-5" />
            </Button>
            <p className="text-xl font-medium tracking-tight text-foreground sm:text-3xl">
              Create Resume
            </p>
          </div>
          <div className="ml-auto">
            <Button onClick={handlePrint}>Export PDF</Button>
          </div>
        </header>
        <div className="mb-5 flex items-center gap-6 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
          <div className="flex flex-1 gap-3">
            {[1, 2, 3].map((id) => (
              <button
                key={id}
                onClick={() => setResume((prev) => ({ ...prev, theme: id }))}
                className={`h-[120px] w-[86px] cursor-pointer rounded-xl bg-neutral-200 ${
                  id === resume.theme
                    ? "border-2 border-c-ff7a00"
                    : "border border-neutral-300"
                }`}
              />
            ))}
          </div>

          <div className="h-20 w-px bg-neutral-300" />

          <div className="flex gap-2.5">
            {resume_color.map((color, idx) => (
              <button
                key={color.value}
                onClick={() => setResume((prev) => ({ ...prev, color: idx }))}
                className={`h-7 w-7 cursor-pointer rounded-full border-2 ${
                  idx === resume.color ? "border-neutral-900" : "border-white"
                } ${resume_color_classes[idx]?.bg ?? "bg-neutral-200"}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[55%_43%] items-start gap-4">
          <FormInput
            resume={resume}
            updateData={updateData}
            updateAddress={updateAddress}
          />

          <div className="">
            <RenderResume resume={resume} templateId={resume.theme} />
          </div>
        </div>

        <div className="fixed left-[-9999px] top-0" aria-hidden="true">
          <div ref={printRef} className="bg-white">
            <Template resume={resume} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

