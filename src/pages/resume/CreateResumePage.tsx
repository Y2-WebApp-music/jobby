import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resume_color } from "@/constants/color";
import FormInput from "@/features/resume/editResume/FormInput";
import RenderResume from "@/features/resume/RenderResume";
import Template1 from "@/features/resume/resumeTemplate/template-1";
import Template2 from "@/features/resume/resumeTemplate/template-2";
import Template3 from "@/features/resume/resumeTemplate/template-3";
import resumeService, {
  mapResumeDetailToResumeForm,
  type CreateResumePayload,
} from "@/services/resumeService";
import profileService, {
  type UserProfileItem,
} from "@/services/profileService";
import utilityService from "@/services/utilityService";
import { useAddressOptionStore } from "@/store/addressOption";
import { useAuthStore } from "@/store/auth";
import { usePropertiesStore } from "@/store/properties";
import { initialResume, type ResumeCreateProps } from "@/types/resumeType";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

const DEFAULT_COUNTRY_TH = "Thailand";
const DEFAULT_COUNTRY_ENG = "KINGDOM OF THAILAND";
const DEFAULT_COUNTRY_ID = 76400;

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
  const pdfThumbPath = "/src/assets/resume-thumb/pdf-thumb.png";

  return (
    resumeThumbModules[thumbPath] ?? resumeThumbModules[pdfThumbPath] ?? null
  );
};

const toIsoOrEmpty = (value: Date | string) => {
  if (!value) return "";
  const formatted = dayjs(value);
  return formatted.isValid() ? formatted.toISOString() : "";
};

const toApiLogo = (value: File | string) =>
  typeof value === "string" ? value : "";

const createItemId = () => crypto.randomUUID();

const mapPhoneRegionOptions = (
  regions: Awaited<ReturnType<typeof utilityService.getPhoneRegion>>["data"],
) =>
  regions.map((item) => ({
    id: item.id,
    label: item.dialing_code ?? "",
    text_th: item.text_th ?? "",
    text_eng: item.text_eng ?? "",
  }));

const mapProvinceOptions = (
  provinces: Awaited<ReturnType<typeof utilityService.getProvince>>["data"],
) =>
  provinces.map((item) => ({
    province_id: item.province_code,
    province_th: item.province_name_th ?? "",
    province_eng: item.province_name_en ?? "",
    country_id: item.country_id,
  }));

const mapDistrictOptions = (
  districts: Awaited<
    ReturnType<typeof utilityService.getDistrict>
  >["data"]["districts"],
) =>
  districts.map((item) => ({
    district_id: item.district_code,
    district_th: item.district_name_th ?? "",
    district_eng: item.district_name_en ?? "",
    province_id: item.province_id,
    sub_district_list: [],
  }));

const mapSubDistrictOptions = (
  subDistricts: Awaited<
    ReturnType<typeof utilityService.getSubDistrict>
  >["data"]["sub_districts"],
) =>
  subDistricts.map((item) => ({
    sub_district_id: item.sub_district_code,
    sub_district_th: item.sub_district_name_th ?? "",
    sub_district_eng: item.sub_district_name_en ?? "",
    district_id: item.district_id,
  }));

const mapUserProfileToResumeFormData = (
  profile: UserProfileItem,
): ResumeCreateProps["data"] => ({
  ...initialResume.data,
  first_name: profile.first_name ?? "",
  last_name: profile.last_name ?? "",
  logo: profile.logo ?? "",
  phone: profile.phone ?? "",
  email: profile.email ?? "",
  contact: (profile.contact ?? []).map((item) => ({
    label: item.label ?? "",
    link: item.link ?? "",
  })),
  skills: (profile.skills ?? []).map((item) => ({
    id: item.id,
    name: item.name,
  })),
  address: {
    ...initialResume.data.address,
    address_line: profile.address?.address_line ?? "",
    no: profile.address?.no ?? "",
    moo: profile.address?.moo ?? "",
    soi: profile.address?.soi ?? "",
    street: profile.address?.street ?? "",
    sub_district:
      profile.address?.sub_district_eng ??
      profile.address?.sub_district_th ??
      "",
    sub_district_th: profile.address?.sub_district_th ?? "",
    sub_district_eng: profile.address?.sub_district_eng ?? "",
    district:
      profile.address?.district_eng ?? profile.address?.district_th ?? "",
    district_th: profile.address?.district_th ?? "",
    district_eng: profile.address?.district_eng ?? "",
    province:
      profile.address?.province_eng ?? profile.address?.province_th ?? "",
    province_th: profile.address?.province_th ?? "",
    province_eng: profile.address?.province_eng ?? "",
    country: profile.address?.country_eng ?? profile.address?.country_th ?? "",
    country_th: profile.address?.country_th ?? DEFAULT_COUNTRY_TH,
    country_eng: profile.address?.country_eng ?? DEFAULT_COUNTRY_ENG,
    sub_district_id: profile.address?.sub_district_id ?? 0,
    district_id: profile.address?.district_id ?? 0,
    province_id: profile.address?.province_id ?? 0,
    country_id: profile.address?.country_id ?? DEFAULT_COUNTRY_ID,
    postal_code: profile.address?.postal_code ?? 0,
  },
});

const toPhoneRegionLabel = (value: number | string) => {
  if (typeof value === "string") {
    return value.startsWith("+") ? value : value ? `+${value}` : "";
  }

  const matchedOption = usePropertiesStore
    .getPhoneRegionOptions()
    .find((item) => item.id === value);

  if (matchedOption?.label) {
    return matchedOption.label;
  }

  return value ? `+${value}` : "";
};

const buildResumePayload = (resume: ResumeCreateProps): CreateResumePayload => {
  const addressStore = useAddressOptionStore.getState();
  const province = addressStore.provinces.find(
    (item) => item.province_id === (resume.data.address.province_id ?? 0),
  );
  const district = addressStore.districts.find(
    (item) => item.district_id === (resume.data.address.district_id ?? 0),
  );
  const subDistrict = district?.sub_district_list?.find(
    (item) =>
      item.sub_district_id === (resume.data.address.sub_district_id ?? 0),
  );
  const fallbackResumeName =
    [resume.data.first_name, resume.data.last_name].filter(Boolean).join(" ") ||
    "Untitled Resume";

  return {
    theme: resume.theme,
    color: resume.color,
    name: resume.name.trim() || fallbackResumeName,
    first_name: resume.data.first_name,
    last_name: resume.data.last_name,
    logo: toApiLogo(resume.data.logo),
    email: resume.data.email,
    phone: resume.data.phone,
    phone_region: toPhoneRegionLabel(resume.data.phone_region),
    address: {
      address_line: resume.data.address.address_line,
      no: resume.data.address.no,
      moo: resume.data.address.moo,
      soi: resume.data.address.soi,
      street: resume.data.address.street,
      sub_district_th:
        subDistrict?.sub_district_th ??
        resume.data.address.sub_district_th ??
        resume.data.address.sub_district ??
        "",
      sub_district_eng:
        subDistrict?.sub_district_eng ??
        resume.data.address.sub_district_eng ??
        resume.data.address.sub_district ??
        "",
      district_th:
        district?.district_th ??
        resume.data.address.district_th ??
        resume.data.address.district ??
        "",
      district_eng:
        district?.district_eng ??
        resume.data.address.district_eng ??
        resume.data.address.district ??
        "",
      province_th:
        province?.province_th ??
        resume.data.address.province_th ??
        resume.data.address.province ??
        "",
      province_eng:
        province?.province_eng ??
        resume.data.address.province_eng ??
        resume.data.address.province ??
        "",
      country_th:
        resume.data.address.country_th ||
        resume.data.address.country ||
        DEFAULT_COUNTRY_TH,
      country_eng:
        resume.data.address.country_eng ||
        resume.data.address.country ||
        DEFAULT_COUNTRY_ENG,
      sub_district_id: resume.data.address.sub_district_id ?? 0,
      district_id: resume.data.address.district_id ?? 0,
      province_id: resume.data.address.province_id ?? 0,
      country_id: resume.data.address.country_id ?? DEFAULT_COUNTRY_ID,
      postal_code: resume.data.address.postal_code ?? 0,
    },
    contact: resume.data.contact
      .filter((item) => item.label.trim() !== "" || item.link.trim() !== "")
      .map((item) => ({
        label: item.label,
        link: item.link,
      })),
    skills: resume.data.skills.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    education: resume.data.education.map((item) => ({
      id: item.id || createItemId(),
      school_name: item.school_name,
      logo: toApiLogo(item.logo),
      degree: item.degree,
      field_of_study: item.field_of_study,
      start_date: toIsoOrEmpty(item.start_date),
      end_date: toIsoOrEmpty(item.end_date),
      gpax: String(item.gpax ?? ""),
    })),
    work_experience: resume.data.work_experience.map((item) => ({
      id: item.id || createItemId(),
      position: item.position,
      logo: toApiLogo(item.logo),
      company_name: item.company_name,
      start_date: toIsoOrEmpty(item.start_date),
      end_date: toIsoOrEmpty(item.end_Date),
      work_type: item.work_type,
      work_type_id: item.work_type_id,
      skills: item.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
      })),
    })),
    projects: resume.data.projects.map((item) => ({
      id: item.id || createItemId(),
      name: item.name,
      description: item.description,
      start_date: toIsoOrEmpty(item.start_date),
      end_date: toIsoOrEmpty(item.end_date),
      skills: item.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
      })),
    })),
    achievement: resume.data.achievement.map((item) => ({
      id: item.id || createItemId(),
      name: item.name,
      project_name: item.project_name,
      description: item.description,
      date: toIsoOrEmpty(item.date),
      skills: item.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
      })),
    })),
  };
};

export default function CreateResumePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [resume, setResume] = useState<ResumeCreateProps>(initialResume);
  const [loadingResumeDetail, setLoadingResumeDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const resumeId = searchParams.get("id")?.trim() || "";
  const isEditMode = resumeId !== "";

  console.log("resume ", resume.data.address.country_id);

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
      const response = await utilityService.getPhoneRegion();
      usePropertiesStore.setPhoneRegions(mapPhoneRegionOptions(response.data));
    } catch {
      return;
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await utilityService.getProvince();
      useAddressOptionStore.setProvinces(mapProvinceOptions(response.data));
    } catch {
      return;
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      const response = await utilityService.getDistrict(provinceId);
      useAddressOptionStore.setDistricts(
        mapDistrictOptions(response.data.districts),
      );
    } catch {
      return;
    }
  };

  const fetchSubDistricts = async (districtId: number) => {
    try {
      const response = await utilityService.getSubDistrict(districtId);
      useAddressOptionStore.setSubDistricts(
        districtId,
        mapSubDistrictOptions(response.data.sub_districts),
      );
    } catch {
      return;
    }
  };

  const fetchPostalCodes = async (subDistrictId: number) => {
    try {
      const response = await utilityService.getPostalCode(subDistrictId);
      useAddressOptionStore.setPostalCodes(
        subDistrictId,
        response.data
          .map((item) => Number(item.postal_code))
          .filter((item) => Number.isFinite(item)),
      );
    } catch {
      return;
    }
  };

  const handleSaveResume = async () => {
    if (!user?.id) {
      toast.error(
        `Please sign in before ${isEditMode ? "updating" : "creating"} a resume`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildResumePayload(resume);
      console.log(payload);
      if (isEditMode) {
        await resumeService.updateUserResume(user.id, resumeId, payload);
      } else {
        await resumeService.createUserResume(user.id, payload);
      }
      toast.success(
        `Resume ${isEditMode ? "updated" : "created"} successfully`,
      );
      navigate("/resume");
    } catch {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} resume`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!resumeId) return;

    let cancelled = false;

    const loadResumeDetail = async () => {
      setLoadingResumeDetail(true);
      try {
        const response = await resumeService.getResumeDetail(resumeId);
        if (!cancelled) {
          setResume(mapResumeDetailToResumeForm(response.data));
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load resume detail");
        }
      } finally {
        if (!cancelled) {
          setLoadingResumeDetail(false);
        }
      }
    };

    void loadResumeDetail();

    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  useEffect(() => {
    if (isEditMode || !user?.id) return;

    let cancelled = false;

    const loadUserProfile = async () => {
      setLoadingResumeDetail(true);
      try {
        const response = await profileService.getUserProfile(user.id);
        if (cancelled) return;

        console.log("response ", response.data);

        setResume((prev) => ({
          ...prev,
          data: mapUserProfileToResumeFormData(response.data),
        }));
      } catch {
        if (!cancelled) {
          toast.error("Failed to load profile data");
        }
      } finally {
        if (!cancelled) {
          setLoadingResumeDetail(false);
        }
      }
    };

    void loadUserProfile();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, user?.id]);

  useEffect(() => {
    if (usePropertiesStore.getPhoneRegionOptions().length === 0) {
      void fetchPhoneRegions();
    }
    if (useAddressOptionStore.getState().provinces.length === 0) {
      void fetchProvinces();
    }
  }, []);

  useEffect(() => {
    const provinceId = resume.data.address.province_id ?? 0;
    if (provinceId > 0) {
      void fetchDistricts(provinceId);
    }
  }, [resume.data.address.province_id]);

  useEffect(() => {
    const districtId = resume.data.address.district_id ?? 0;
    if (districtId > 0) {
      void fetchSubDistricts(districtId);
    }
  }, [resume.data.address.district_id]);

  useEffect(() => {
    const subDistrictId = resume.data.address.sub_district_id ?? 0;
    if (subDistrictId > 0) {
      void fetchPostalCodes(subDistrictId);
    }
  }, [resume.data.address.sub_district_id]);

  useEffect(() => {
    const districtId = resume.data.address.district_id ?? 0;
    const subDistrictId = resume.data.address.sub_district_id ?? 0;
    if (!districtId || !subDistrictId) return;

    const postalCode = useAddressOptionStore.getPostalCode(
      districtId,
      subDistrictId,
    );
    if (postalCode && resume.data.address.postal_code !== postalCode) {
      updateAddress("postal_code", postalCode);
    }
  }, [
    resume.data.address.district_id,
    resume.data.address.sub_district_id,
    resume.data.address.postal_code,
  ]);

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
              {isEditMode ? "Edit Resume" : "Create Resume"}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-3">
            <Button variant="outline" onClick={handlePrint}>
              Export PDF
            </Button>
            <Button
              onClick={handleSaveResume}
              disabled={isSubmitting || loadingResumeDetail}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : loadingResumeDetail
                  ? "Loading..."
                  : isEditMode
                    ? "Update Resume"
                    : "Create Resume"}
            </Button>
          </div>
        </header>

        <div className="flex gap-2 w-full">
          <div className="grow mb-5 rounded-xl border border-neutral-200 bg-white p-4">
            <label
              htmlFor="resume-name"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Resume Name
            </label>
            <Input
              id="resume-name"
              placeholder="Resume Name"
              value={resume.name}
              onChange={(e) =>
                setResume((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="grow mb-5 flex items-center gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex flex-1 gap-3">
              {[1, 2, 3].map((id) =>
                (() => {
                  const thumbUrl = resolveThemePreviewUrl(id, resume.color);

                  return (
                    <button
                      key={id}
                      onClick={() =>
                        setResume((prev) => ({ ...prev, theme: id }))
                      }
                      className={`h-[120px] w-[86px] cursor-pointer overflow-hidden rounded-xl bg-neutral-200 ${
                        id === resume.theme
                          ? "border-2 border-c-ff7a00"
                          : "border border-neutral-300"
                      }`}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={`Theme ${id} preview`}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : null}
                    </button>
                  );
                })(),
              )}
            </div>

            <div className="h-20 w-px bg-neutral-300" />

            <div className="flex gap-2.5">
              {resume_color.map((color, idx) => (
                <button
                  key={color.value}
                  onClick={() => setResume((prev) => ({ ...prev, color: idx }))}
                  className={`h-7 w-7 cursor-pointer rounded-full border-2 ${
                    idx === resume.color ? "border-neutral-900" : "border-white"
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[55%_43%] items-start gap-4">
          <FormInput
            resume={resume}
            updateData={updateData}
            updateAddress={updateAddress}
          />

          <div>
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
