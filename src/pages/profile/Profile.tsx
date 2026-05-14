import { useEffect, useRef, useState } from "react";
import { RiPencilFill } from "react-icons/ri";
import { CgClose } from "react-icons/cg";
import ImageEditor from "../../features/profile/dialog/ImageEditorModel";
import ProfileDialog, {
  type ProfileFormValue,
} from "../../features/profile/dialog/ProfileDialog";
import AboutDialog from "../../features/profile/dialog/AboutDialog";
import EducateDialog, {
  type EducationItem,
} from "../../features/profile/dialog/EducateDialog";
import WorkexpDialog, {
  type WorkExperienceItem,
} from "../../features/profile/dialog/WorkexpDialog";
import AddskillDialog from "../../features/profile/dialog/AddskillDialog";
import SkillinfoDialog from "../../features/profile/dialog/SkillinfoDialog";
import AchievementDialog, {
  type AchievementItem,
} from "../../features/profile/dialog/AchievementDialog";
import ProjectDialog, {
  type ProjectItem,
} from "../../features/profile/dialog/ProjectDialog";
import Thumbnail from "@/assets/Thumbnail.svg";
import { Button } from "@/components/ui/button";
import type { ApplicationItem } from "@/types/profile";
import PageLayout from "@/components/layout/PageLayout";
import {
  changeAuthEmail,
  hydrateAuthStoreFromSession,
} from "@/services/authClient";
import profileService, {
  type UserProfileItem,
} from "@/services/profileService";
import { useAddressOptionStore } from "@/store/addressOption";
import { useAuthStore } from "@/store/auth";
import { usePhoneRegionStore } from "@/store/phoneRegion";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const DialogID = {
  PROFILE_EDIT: "profile-edit",
  ABOUT: "about",
  SKILL_ADD: "skill-add",
  EDUCATION: "education",
  WORK_EXPERIENCE: "work-experience",
  ACHIEVEMENT: "achievement",
  PROJECT: "project",
  PROJECT_PREVIEW: "project-preview",
  ACHIEVEMENT_PREVIEW: "achievement-preview",
} as const;

const OverlayDialogID = {
  IMAGE_EDITOR: "image-editor",
  SKILL_INFO: "skill-info",
} as const;

type DialogId = (typeof DialogID)[keyof typeof DialogID];
type OverlayDialogId = (typeof OverlayDialogID)[keyof typeof OverlayDialogID];

const createEmptyProfileForm = (): ProfileFormValue => ({
  firstName: "",
  lastName: "",
  phone_region: "",
  phone: "",
  email: "",
  addressLine: "",
  addressNo: "",
  moo: "",
  soi: "",
  street: "",
  province: "",
  district: "",
  subDistrict: "",
  postalCode: "",
  links: [],
});

const formatDisplayDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = formatDisplayDate(startDate);
  const end = formatDisplayDate(endDate);

  if (!start && !end) return "";
  return `${start || "-"} - ${end || "Present"}`;
};

const toNumericId = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePhone = (value: string) => value.replace(/\D/g, "");
const normalizeSkillName = (value: string) => value.trim().toLowerCase();

const normalizeContactUrl = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const PHONE_REGION_TO_REGION_CODE = {
  THA: "THA",
  "66": "THA",
  "+66": "THA",
  CHN: "CHN",
  "86": "CHN",
  "+86": "CHN",
  JPN: "JPN",
  "81": "JPN",
  "+81": "JPN",
  GBR: "GBR",
  UK: "GBR",
  "44": "GBR",
  "+44": "GBR",
} as const;

const dataUrlToFile = async (dataUrl: string, fileName: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, {
    type: blob.type || "image/jpeg",
  });
};

const inferRegionCode = (profile: UserProfileItem) => {
  const rawPhoneRegion = String(profile.phone_region ?? "")
    .trim()
    .toUpperCase();
  const mappedRegion =
    PHONE_REGION_TO_REGION_CODE[
      rawPhoneRegion as keyof typeof PHONE_REGION_TO_REGION_CODE
    ];

  if (mappedRegion) {
    return mappedRegion;
  }

  const country =
    `${profile.address?.country_eng ?? ""} ${profile.address?.country_th ?? ""}`.toLowerCase();
  const phone = normalizePhone(profile.phone ?? "");

  if (phone.startsWith("81") || country.includes("japan")) return "JPN";
  if (phone.startsWith("86") || country.includes("china")) return "CHN";
  if (
    phone.startsWith("44") ||
    country.includes("united kingdom") ||
    country.includes("england")
  ) {
    return "GBR";
  }

  return "THA";
};

const mapUserProfileToProfileForm = (
  profile: UserProfileItem,
): ProfileFormValue => ({
  firstName: profile.first_name ?? "",
  lastName: profile.last_name ?? "",
  phone_region: inferRegionCode(profile),
  phone: normalizePhone(profile.phone ?? ""),
  email: profile.email ?? "",
  addressLine: profile.address?.address_line ?? "",
  addressNo: profile.address?.no ?? "",
  moo: profile.address?.moo ?? "",
  soi: profile.address?.soi ?? "",
  street: profile.address?.street ?? "",
  province: profile.address?.province_eng ?? profile.address?.province_th ?? "",
  district: profile.address?.district_eng ?? profile.address?.district_th ?? "",
  subDistrict:
    profile.address?.sub_district_eng ?? profile.address?.sub_district_th ?? "",
  postalCode: profile.address?.postal_code
    ? String(profile.address.postal_code)
    : "",
  links: (profile.contact ?? []).map((item, index) => ({
    id: index + 1,
    label: item.label ?? "",
    url: item.link ?? "",
  })),
});

const mapEducationItems = (
  items: UserProfileItem["education"] = [],
): EducationItem[] =>
  items.map((item, index) => ({
    id: toNumericId(item.id, index + 1),
    backendId: item.id,
    logo: item.logo ?? null,
    school: item.school_name ?? "",
    degree: item.degree ?? "",
    fieldOfStudy: item.field_of_study ?? "",
    startDate: item.start_date ?? "",
    endDate: item.end_date ?? "",
    gpax: item.gpax ?? "",
    date: formatDateRange(item.start_date, item.end_date),
  }));

const mapWorkExperienceItems = (
  items: UserProfileItem["work_experience"] = [],
): WorkExperienceItem[] =>
  items.map((item, index) => ({
    id: toNumericId(item.id, index + 1),
    backendId: item.id,
    logo: item.logo ?? null,
    companyId: "",
    workTypeId: item.work_type_id ?? 0,
    skillItems: (item.skills ?? []).map((skill) => ({
      id: skill.id,
      name: skill.name,
    })),
    position: item.position ?? "",
    company: item.company_name ?? "",
    workType: item.work_type ?? "",
    skills: (item.skills ?? []).map((skill) => skill.name).filter(Boolean),
    startDate: item.start_date ?? "",
    endDate: item.end_date ?? "",
    isFinished: Boolean(item.end_date),
    date: formatDateRange(item.start_date, item.end_date),
  }));

const mapProjectItems = (
  items: UserProfileItem["projects"] = [],
): ProjectItem[] =>
  items.map((item, index) => {
    const existingImages = (item.images ?? [])
      .map((image) => image.image)
      .filter(Boolean);

    return {
      id: toNumericId(item.id, index + 1),
      backendId: item.id,
      skillItems: (item.skills ?? []).map((skill) => ({
        id: skill.id,
        name: skill.name,
      })),
      existingImages,
      newImages: [],
      name: item.name ?? "",
      description: item.description ?? "",
      skills: (item.skills ?? []).map((skill) => skill.name).filter(Boolean),
      startDate: item.start_date ?? "",
      endDate: item.end_date ?? "",
      images: existingImages,
      date: formatDateRange(item.start_date, item.end_date),
    };
  });

const mapAchievementItems = (
  items: UserProfileItem["achievement"] = [],
): AchievementItem[] =>
  items.map((item, index) => {
    const existingImages = (item.images ?? [])
      .map((image) => image.image)
      .filter(Boolean);

    return {
      id: toNumericId(item.id, index + 1),
      backendId: item.id,
      skillItems: (item.skills ?? []).map((skill) => ({
        id: skill.id,
        name: skill.name,
      })),
      existingImages,
      newImages: [],
      name: item.name ?? "",
      from: item.project_name ?? "",
      description: item.description ?? "",
      skills: (item.skills ?? []).map((skill) => skill.name).filter(Boolean),
      images: existingImages,
      date: item.date ?? "",
    };
  });

const mapApplications = (
  items: Awaited<ReturnType<typeof profileService.getDynamicInfo>>["data"],
): ApplicationItem[] =>
  items.map((item, index) => ({
    id: toNumericId(item.job_id, index + 1),
    title: item.name ?? "",
    company: item.company_name ?? "",
    note: item.applied_date
      ? `Applied ${formatDisplayDate(item.applied_date)}`
      : "Applied recently",
  }));

const buildLocationLabel = (profileForm: ProfileFormValue) => {
  const location = [
    profileForm.subDistrict,
    profileForm.district,
    profileForm.province,
  ]
    .filter(Boolean)
    .join(", ");

  return location;
};

function SectionHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="break-words text-sm font-semibold text-slate-900">
        {title}
      </h3>
      <button
        type="button"
        onClick={onEdit}
        className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        aria-label={`Edit ${title}`}
      >
        <RiPencilFill className="mx-auto h-4 w-4" />
      </button>
    </div>
  );
}

function CardItem({
  title,
  subtitle,
  meta,
  onClick,
  subtitleClassName = "",
}: {
  title: string;
  subtitle: string;
  meta: string;
  onClick?: () => void;
  subtitleClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left ${
        onClick ? "cursor-pointer hover:bg-slate-100" : ""
      }`}
    >
      <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />
      <div className="min-w-0">
        <div className="break-words text-sm font-semibold text-slate-900">
          {title}
        </div>
        <div
          className={`break-words text-xs text-slate-600 ${subtitleClassName}`}
        >
          {subtitle}
        </div>
        <div className="break-words text-xs text-slate-500">{meta}</div>
      </div>
    </button>
  );
}

function SkillApplicationSection({
  skills,
  applications,
  isLoadingApplications = false,
  onNewSkill,
  onOpenSkillInfo,
  onShowMore,
}: {
  skills: string[];
  applications: ApplicationItem[];
  isLoadingApplications?: boolean;
  onNewSkill: () => void;
  onOpenSkillInfo: (skill: string) => void;
  onShowMore?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="wrap-break-word text-sm font-semibold text-slate-900">
            Your Skill
          </h3>
          <Button
            type="button"
            onClick={onNewSkill}
            className="rounded-full bg-linear-to-r from-main to-second px-3 py-1 text-xs font-medium text-white shadow-sm"
          >
            <PlusIcon className="size-4" /> New Skill
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button
              type="button"
              onClick={() => onOpenSkillInfo(skill)}
              key={skill}
              className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
            >
              {skill}
            </button>
          ))}
        </div>
        {onShowMore ? (
          <button
            type="button"
            onClick={onShowMore}
            className="mx-auto mt-3 block text-xs text-main"
          >
            Show more
          </button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="wrap-break-word text-sm font-semibold text-slate-900">
          Your Application
        </h3>
        <div className="mt-3 space-y-3">
          {isLoadingApplications ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-500">
              Loading applications...
            </div>
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <div
                key={app.id}
                className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3"
              >
                <div className="h-12 w-12 rounded-2xl bg-slate-300" />
                <div>
                  <div className="break-words text-sm font-semibold text-slate-900">
                    {app.title}
                  </div>
                  <div className="text-xs text-slate-600">{app.company}</div>
                  <div className="break-words text-xs text-slate-500">
                    {app.note}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-500">
              No applications yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string>(Thumbnail);
  const [openDialog, setOpenDialog] = useState<DialogId | null>(null);
  const [openOverlayDialog, setOpenOverlayDialog] =
    useState<OverlayDialogId | null>(null);
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null,
  );
  const [achievementEditingId, setAchievementEditingId] = useState<
    number | null
  >(null);
  const [previewAchievementId, setPreviewAchievementId] = useState<
    number | null
  >(null);
  const [achievementDirectEditMode, setAchievementDirectEditMode] =
    useState(false);
  const [projectEditingId, setProjectEditingId] = useState<number | null>(null);
  const [previewProjectId, setPreviewProjectId] = useState<number | null>(null);
  const [projectDirectEditMode, setProjectDirectEditMode] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>(
    [],
  );
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [profileForm, setProfileForm] = useState<ProfileFormValue>(
    createEmptyProfileForm(),
  );
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userSkillItems, setUserSkillItems] = useState<
    UserProfileItem["skills"]
  >([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [editingTarget, setEditingTarget] = useState<
    "profile" | "banner" | null
  >(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const projectImageListRef = useRef<HTMLDivElement | null>(null);
  const achievementImageListRef = useRef<HTMLDivElement | null>(null);

  const isDefaultBanner = bannerUrl === Thumbnail;
  const locationLabel = buildLocationLabel(profileForm);

  const refreshProfile = async () => {
    if (!user?.id) return;

    setIsLoadingProfile(true);

    const [profileResult, dynamicInfoResult] = await Promise.allSettled([
      profileService.getUserProfile(user.id),
      profileService.getDynamicInfo(user.id),
    ]);

    if (profileResult.status === "fulfilled") {
      const profile = profileResult.value.data;

      setProfileUrl(profile.logo || null);
      setBannerUrl(profile.banner || Thumbnail);
      setProfileForm(mapUserProfileToProfileForm(profile));
      setAboutText(profile.about ?? "");
      setEducation(mapEducationItems(profile.education));
      setWorkExperience(mapWorkExperienceItems(profile.work_experience));
      setAchievements(mapAchievementItems(profile.achievement));
      setProjects(mapProjectItems(profile.projects));
      setUserSkillItems(profile.skills ?? []);
      setUserSkills(
        Array.from(
          new Set(
            (profile.skills ?? []).map((skill) => skill.name).filter(Boolean),
          ),
        ),
      );
    } else {
      toast.error("Failed to load profile data");
    }

    if (dynamicInfoResult.status === "fulfilled") {
      setApplications(mapApplications(dynamicInfoResult.value.data));
    } else {
      setApplications([]);
    }

    setIsLoadingProfile(false);
  };

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const loadProfile = async () => {
      setIsLoadingProfile(true);

      const [profileResult, dynamicInfoResult] = await Promise.allSettled([
        profileService.getUserProfile(user.id),
        profileService.getDynamicInfo(user.id),
      ]);

      if (cancelled) return;

      if (profileResult.status === "fulfilled") {
        const profile = profileResult.value.data;

        setProfileUrl(profile.logo || null);
        setBannerUrl(profile.banner || Thumbnail);
        setProfileForm(mapUserProfileToProfileForm(profile));
        setAboutText(profile.about ?? "");
        setEducation(mapEducationItems(profile.education));
        setWorkExperience(mapWorkExperienceItems(profile.work_experience));
        setAchievements(mapAchievementItems(profile.achievement));
        setProjects(mapProjectItems(profile.projects));
        setUserSkillItems(profile.skills ?? []);
        setUserSkills(
          Array.from(
            new Set(
              (profile.skills ?? []).map((skill) => skill.name).filter(Boolean),
            ),
          ),
        );
      } else {
        toast.error("Failed to load profile data");
      }

      if (dynamicInfoResult.status === "fulfilled") {
        setApplications(mapApplications(dynamicInfoResult.value.data));
      } else {
        setApplications([]);
      }

      setIsLoadingProfile(false);
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    void usePhoneRegionStore.fetchPhoneRegions();
  }, []);

  const handleSelectImage = (file: File, target: "profile" | "banner") => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert("Please select an image smaller than or equal to 15MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setEditingImage(url);
    setEditingTarget(target);
    setOpenOverlayDialog(OverlayDialogID.IMAGE_EDITOR);
  };

  const handleCloseEditor = () => {
    setOpenOverlayDialog(null);
    if (editingImage?.startsWith("blob:")) {
      URL.revokeObjectURL(editingImage);
    }
    setEditingImage(null);
    setEditingTarget(null);
  };

  const resolveSkillPayloads = (
    skills: string[],
    itemSkills: { id?: string; name: string }[] = [],
  ) =>
    skills.map((skill, index) => {
      const matchedItemSkill = itemSkills.find(
        (item) => normalizeSkillName(item.name) === normalizeSkillName(skill),
      );
      const matchedUserSkill = userSkillItems.find(
        (item) => normalizeSkillName(item.name) === normalizeSkillName(skill),
      );

      return {
        skill_id:
          matchedItemSkill?.id ?? matchedUserSkill?.id ?? `${skill}-${index}`,
        skill_name: skill,
      };
    });

  const handleSaveImage = async (image: string) => {
    if (!user?.id || !editingTarget) return;

    try {
      const file = await dataUrlToFile(
        image,
        editingTarget === "profile" ? "profile.jpg" : "banner.jpg",
      );

      await profileService.updateProfileMedia(
        user.id,
        editingTarget === "profile" ? { logo: file } : { banner: file },
      );

      if (editingTarget === "profile") {
        setProfileUrl(image);
      } else {
        setBannerUrl(image);
      }
      toast.success("Profile media updated");
    } catch {
      toast.error("Failed to update profile media");
    }
  };

  const handleOpenProjectPreview = (projectId: number) => {
    setPreviewProjectId(projectId);
    setOpenDialog(DialogID.PROJECT_PREVIEW);
  };

  const handleOpenAchievementPreview = (achievementId: number) => {
    setPreviewAchievementId(achievementId);
    setOpenDialog(DialogID.ACHIEVEMENT_PREVIEW);
  };

  const handleScrollProjectImages = (direction: "left" | "right") => {
    const el = projectImageListRef.current;
    if (!el) return;
    const amount = direction === "left" ? -260 : 260;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleScrollAchievementImages = (direction: "left" | "right") => {
    const el = achievementImageListRef.current;
    if (!el) return;
    const amount = direction === "left" ? -260 : 260;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const previewProject =
    projects.find((item) => item.id === previewProjectId) ?? null;
  const previewAchievement =
    achievements.find((item) => item.id === previewAchievementId) ?? null;

  const handleSaveProfile = async (nextProfileForm: ProfileFormValue) => {
    if (!user?.id) return;

    const nextEmail = nextProfileForm.email.trim();
    const currentEmail = profileForm.email.trim();
    const emailChanged = nextEmail !== currentEmail;

    if (!nextEmail) {
      toast.error("Email is required");
      throw new Error("Missing email");
    }

    const regionMeta = await usePhoneRegionStore.getRegionMetadata(
      nextProfileForm.phone_region,
    );
    const provinceOptions = useAddressOptionStore.getProvinceOptions();
    const provinceOption = provinceOptions.find(
      (item) => item.value === nextProfileForm.province,
    );
    const districtOptions = useAddressOptionStore.getDistrictOptions(
      provinceOption?.id,
    );
    const districtOption = districtOptions.find(
      (item) => item.value === nextProfileForm.district,
    );
    const subDistrictOptions = districtOption
      ? useAddressOptionStore.getSubDistrictOptions(districtOption.id)
      : [];
    const subDistrictOption = subDistrictOptions.find(
      (item) => item.value === nextProfileForm.subDistrict,
    );
    const addressStore = useAddressOptionStore.getState();
    const provinceRecord = addressStore.provinces.find(
      (item) => item.province_id === provinceOption?.id,
    );
    const districtRecord = addressStore.districts.find(
      (item) => item.district_id === districtOption?.id,
    );
    const subDistrictRecord =
      districtRecord?.sub_district_list?.find(
        (item) => item.sub_district_id === subDistrictOption?.id,
      ) ?? null;
    const postalCode =
      (districtOption && subDistrictOption
        ? useAddressOptionStore.getPostalCode(
            districtOption.id,
            subDistrictOption.id,
          )
        : undefined) ??
      (nextProfileForm.postalCode
        ? Number(nextProfileForm.postalCode.replace(/\D/g, "")) || undefined
        : undefined);

    if (postalCode && !subDistrictOption?.id) {
      toast.error("Please select a sub-district that matches the postal code");
      throw new Error("Missing sub_district_id for postal code");
    }

    try {
      await profileService.updateProfile(user.id, {
        email: nextEmail,
        first_name: nextProfileForm.firstName.trim(),
        last_name: nextProfileForm.lastName.trim(),
        phone: nextProfileForm.phone.trim(),
        phone_region: `+${regionMeta.dialCode.replace(/^\+/, "")}`,
        address: {
          address_line: nextProfileForm.addressLine.trim() || undefined,
          no: nextProfileForm.addressNo.trim() || undefined,
          moo: nextProfileForm.moo.trim() || undefined,
          soi: nextProfileForm.soi.trim() || undefined,
          street: nextProfileForm.street.trim() || undefined,
          sub_district_th: subDistrictRecord?.sub_district_th,
          sub_district_eng: nextProfileForm.subDistrict.trim() || undefined,
          district_th: districtRecord?.district_th,
          district_eng: nextProfileForm.district.trim() || undefined,
          province_th: provinceRecord?.province_th,
          province_eng: nextProfileForm.province.trim() || undefined,
          country_th: regionMeta.countryTh,
          country_eng: regionMeta.countryEng,
          sub_district_id: subDistrictOption?.id,
          district_id: districtOption?.id,
          province_id: provinceOption?.id,
          country_id: provinceRecord?.country_id ?? regionMeta.countryId,
          postal_code: postalCode,
        },
        contact: nextProfileForm.links
          .filter((item) => item.label.trim() && item.url.trim())
          .map((item) => ({
            label: item.label.trim(),
            link: item.url.trim(),
          })),
      });
    } catch {
      toast.error("Failed to update profile");
      throw new Error("Failed to update profile");
    }

    if (emailChanged) {
      try {
        const response = await changeAuthEmail({
          newEmail: nextEmail,
          callbackURL: window.location.href,
        });

        if (response?.error) {
          toast.error(response.error.message || "Failed to update email");
          await refreshProfile();
          return;
        }

        await hydrateAuthStoreFromSession();
      } catch {
        toast.error("Profile updated, but failed to update email");
        await refreshProfile();
        return;
      }
    }

    toast.success(
      emailChanged
        ? "Profile updated. Check your email to confirm the new address."
        : "Profile updated",
    );
    await refreshProfile();
  };

  const handleSaveAbout = async (value: string) => {
    if (!user?.id) return;

    try {
      await profileService.updateAbout(user.id, { about: value });
      setAboutText(value);
      toast.success("About updated");
    } catch {
      toast.error("Failed to update about");
    }
  };

  const handleAddProfileSkill = async (skill: string) => {
    if (!skill || !user?.id) return;
    if (
      userSkills.some(
        (item) => normalizeSkillName(item) === normalizeSkillName(skill),
      )
    ) {
      return;
    }

    setUserSkills((prev) => [...prev, skill]);

    try {
      const matched = userSkillItems.find(
        (item) => normalizeSkillName(item.name) === normalizeSkillName(skill),
      );
      await profileService.addUserSkill(user.id, {
        skill_id: matched?.id ?? skill,
        skill_name: skill,
        index: userSkills.length,
      });
      toast.success("Skill added");
      void refreshProfile();
    } catch {
      setUserSkills((prev) =>
        prev.filter(
          (item) => normalizeSkillName(item) !== normalizeSkillName(skill),
        ),
      );
      toast.error("Failed to add skill");
    }
  };

  const handleRemoveProfileSkill = () => {
    toast.error("Removing skills is not connected yet");
  };

  const handleSaveEducation = async (nextItems: EducationItem[]) => {
    if (!user?.id) return;

    const removedPersistedItems = education.filter(
      (item) =>
        item.backendId &&
        !nextItems.some((nextItem) => nextItem.backendId === item.backendId),
    );

    try {
      await Promise.all(
        removedPersistedItems.map((item) =>
          profileService.deleteEducation(user.id, item.backendId as string),
        ),
      );
    } catch {
      toast.error("Failed to delete education");
      return;
    }

    try {
      await Promise.all(
        nextItems.map((item, index) => {
          const payload = {
            index,
            school_name: item.school.trim(),
            logo: item.logo ?? null,
            degree: item.degree.trim(),
            field_of_study: item.fieldOfStudy.trim(),
            start_date: item.startDate,
            end_date: item.endDate || null,
            gpax: Number(item.gpax || 0),
          };

          return item.backendId
            ? profileService.updateEducation(user.id, item.backendId, payload)
            : profileService.createEducation(user.id, payload);
        }),
      );
    } catch {
      toast.error("Failed to save education changes");
      return;
    }

    toast.success(
      removedPersistedItems.length > 0
        ? "Education deleted"
        : "Education updated",
    );
    void refreshProfile();
  };

  const handleSaveWorkExperience = async (nextItems: WorkExperienceItem[]) => {
    if (!user?.id) return;

    const removedPersistedItems = workExperience.filter(
      (item) =>
        item.backendId &&
        !nextItems.some((nextItem) => nextItem.backendId === item.backendId),
    );

    try {
      await Promise.all(
        removedPersistedItems.map((item) =>
          profileService.deleteWorkExperience(
            user.id,
            item.backendId as string,
          ),
        ),
      );
    } catch (error) {
      toast.error("Failed to delete work experience");
      throw error;
    }

    try {
      await Promise.all(
        nextItems.map((item, index) => {
          const payload = {
            index,
            position: item.position.trim(),
            logo: item.logo ?? null,
            company_name: item.company.trim(),
            company_id: item.companyId ?? "",
            start_date: item.startDate,
            end_date: item.isFinished ? item.endDate || null : null,
            work_type: item.workType.trim(),
            work_type_id: item.workTypeId ?? 0,
            skills: resolveSkillPayloads(item.skills, item.skillItems),
          };

          return item.backendId
            ? profileService.updateWorkExperience(
                user.id,
                item.backendId,
                payload,
              )
            : profileService.createWorkExperience(user.id, payload);
        }),
      );
    } catch (error) {
      toast.error("Failed to save work experience changes");
      throw error;
    }

    toast.success(
      removedPersistedItems.length > 0
        ? "Work experience deleted"
        : "Work experience updated",
    );
    await refreshProfile();
  };

  const handleSaveProjects = async (nextItems: ProjectItem[]) => {
    if (!user?.id) return;

    const removedPersistedItems = projects.filter(
      (item) =>
        item.backendId &&
        !nextItems.some((nextItem) => nextItem.backendId === item.backendId),
    );

    const removedExistingImages = nextItems.some((item) => {
      const previousItem = projects.find(
        (projectItem) => projectItem.backendId === item.backendId,
      );
      if (!previousItem?.backendId) return false;

      return (previousItem.existingImages ?? []).some(
        (image) => !(item.existingImages ?? []).includes(image),
      );
    });
    if (removedExistingImages) {
      toast.error("Deleting existing project images is not connected yet");
      throw new Error("Deleting existing project images is not connected yet");
    }

    try {
      await Promise.all(
        removedPersistedItems.map((item) =>
          profileService.deleteProject(user.id, item.backendId as string),
        ),
      );
    } catch (error) {
      toast.error("Failed to delete project");
      throw error;
    }

    try {
      await Promise.all(
        nextItems.map((item, index) => {
          const payload = {
            payload: {
              index,
              name: item.name.trim(),
              description: item.description.trim(),
              start_date: item.startDate,
              end_date: item.endDate,
              skills: resolveSkillPayloads(item.skills, item.skillItems),
            },
            images: (item.newImages ?? []).map((image) => image.file),
          };

          return item.backendId
            ? profileService.updateProject(user.id, item.backendId, payload)
            : profileService.createProject(user.id, payload);
        }),
      );
    } catch (error) {
      toast.error("Failed to save project changes");
      throw error;
    }

    toast.success(
      removedPersistedItems.length > 0 ? "Project deleted" : "Projects updated",
    );
    await refreshProfile();
  };

  const handleSaveAchievements = async (nextItems: AchievementItem[]) => {
    if (!user?.id) return;

    const removedPersistedItems = achievements.filter(
      (item) =>
        item.backendId &&
        !nextItems.some((nextItem) => nextItem.backendId === item.backendId),
    );

    const removedExistingImages = nextItems.some((item) => {
      const previousItem = achievements.find(
        (achievementItem) => achievementItem.backendId === item.backendId,
      );
      if (!previousItem?.backendId) return false;

      return (previousItem.existingImages ?? []).some(
        (image) => !(item.existingImages ?? []).includes(image),
      );
    });
    if (removedExistingImages) {
      toast.error("Deleting existing achievement images is not connected yet");
      throw new Error(
        "Deleting existing achievement images is not connected yet",
      );
    }

    try {
      await Promise.all(
        removedPersistedItems.map((item) =>
          profileService.deleteAchievement(user.id, item.backendId as string),
        ),
      );
    } catch (error) {
      toast.error("Failed to delete achievement");
      throw error;
    }

    try {
      await Promise.all(
        nextItems.map((item, index) => {
          const payload = {
            payload: {
              index,
              name: item.name.trim(),
              project_name: item.from.trim(),
              description: item.description.trim(),
              date: item.date,
              skills: resolveSkillPayloads(item.skills, item.skillItems),
            },
            images: (item.newImages ?? []).map((image) => image.file),
          };

          return item.backendId
            ? profileService.updateAchievement(user.id, item.backendId, payload)
            : profileService.createAchievement(user.id, payload);
        }),
      );
    } catch (error) {
      toast.error("Failed to save achievement changes");
      throw error;
    }

    toast.success(
      removedPersistedItems.length > 0
        ? "Achievement deleted"
        : "Achievements updated",
    );
    await refreshProfile();
  };

  const handleOpenSkillInfo = (skill: string) => {
    setSelectedSkillName(skill);
    setOpenOverlayDialog(OverlayDialogID.SKILL_INFO);
  };

  return (
    <PageLayout>
      <div className="min-h-screen">
        <div className="relative mx-4 mt-6 aspect-[1411/275] w-auto overflow-hidden rounded-[20px] bg-slate-100 sm:mx-6 sm:mt-8">
          <input
            id="banner-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleSelectImage(file, "banner");
            }}
          />

          <img
            src={bannerUrl}
            alt="Banner"
            className={`h-full w-full ${isDefaultBanner ? "object-contain" : "object-cover"}`}
          />

          <label
            htmlFor="banner-upload"
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-sm font-medium text-white opacity-0 transition-opacity hover:opacity-100"
          >
            Upload Banner
          </label>
        </div>

        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:gap-6">
            <div className="relative -mt-10 h-28 w-28 sm:-mt-14 sm:h-40 sm:w-40">
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  handleSelectImage(file, "profile");
                }}
              />
              <div className="group relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-300 shadow-md sm:h-40 sm:w-40">
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <label
                  htmlFor="profile-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Upload Profile
                </label>
              </div>
            </div>
            <div className="flex-1 md:mt-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {`${profileForm.firstName} ${profileForm.lastName}`.trim()}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpenDialog(DialogID.PROFILE_EDIT)}
                  className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
                  aria-label="Edit profile"
                >
                  <RiPencilFill className="h-4 w-4" />
                </button>
              </div>
              {profileForm.addressLine || profileForm.addressNo ? (
                <p className="text-sm text-slate-600">
                  {profileForm.addressLine}
                  {profileForm.addressNo ? (
                    <span className="text-slate-400">
                      {profileForm.addressLine ? " " : ""}(
                      {profileForm.addressNo})
                    </span>
                  ) : null}
                </p>
              ) : null}
              {locationLabel ? (
                <p className="text-sm text-slate-500">{locationLabel}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                {profileForm.email ? (
                  <a
                    href={`mailto:${profileForm.email}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 hover:border-slate-300 hover:text-slate-900"
                  >
                    {profileForm.email}
                  </a>
                ) : null}
                {profileForm.phone ? (
                  <a
                    href={`tel:+${profileForm.phone}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 hover:border-slate-300 hover:text-slate-900"
                  >
                    +{profileForm.phone}
                  </a>
                ) : null}
                {profileForm.links
                  .filter((link) => link.url.trim())
                  .map((link) => (
                    <a
                      key={`${link.id}-${link.label}-${link.url}`}
                      href={normalizeContactUrl(link.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 hover:border-slate-300 hover:text-slate-900"
                    >
                      {link.label || link.url}
                    </a>
                  ))}
              </div>
            </div>
            <Button
              type="button"
              className="mt-3 h-9 rounded-full bg-gradient-to-r from-main to-second px-4 text-sm font-medium text-white shadow-sm md:mt-3"
            >
              Your Resume
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <SectionHeader
                  title="About"
                  onEdit={() => setOpenDialog(DialogID.ABOUT)}
                />
                <p className="mt-3 whitespace-pre-line break-all text-sm leading-relaxed text-slate-600">
                  {isLoadingProfile
                    ? "Loading profile..."
                    : aboutText || "No about information yet."}
                </p>
              </div>

              <div className="lg:hidden">
                <SkillApplicationSection
                  skills={userSkills}
                  applications={applications}
                  isLoadingApplications={isLoadingProfile}
                  onNewSkill={() => setOpenDialog(DialogID.SKILL_ADD)}
                  onOpenSkillInfo={handleOpenSkillInfo}
                />
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <SectionHeader
                  title="Education"
                  onEdit={() => setOpenDialog(DialogID.EDUCATION)}
                />
                <div
                  className={`mt-3 space-y-3 ${
                    education.length > 3
                      ? "max-h-[300px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
                  {education.map((item) => (
                    <CardItem
                      key={item.id}
                      title={item.school}
                      subtitle={[item.degree, item.fieldOfStudy]
                        .filter(Boolean)
                        .join(", ")}
                      meta={item.date}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <SectionHeader
                  title="Work Experience"
                  onEdit={() => setOpenDialog(DialogID.WORK_EXPERIENCE)}
                />
                <div
                  className={`mt-3 space-y-3 ${
                    workExperience.length > 3
                      ? "max-h-[300px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
                  {workExperience.map((item) => (
                    <CardItem
                      key={item.id}
                      title={item.position}
                      subtitle={item.company}
                      meta={item.date}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <SectionHeader
                  title="Project"
                  onEdit={() => {
                    setProjectEditingId(null);
                    setProjectDirectEditMode(false);
                    setOpenDialog(DialogID.PROJECT);
                  }}
                />
                <div
                  className={`mt-3 space-y-3 ${
                    projects.length > 3
                      ? "max-h-[300px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
                  {projects.map((item) => (
                    <CardItem
                      key={item.id}
                      title={item.name}
                      subtitle={item.description}
                      meta={item.date}
                      subtitleClassName="line-clamp-4 whitespace-pre-line break-words"
                      onClick={() => handleOpenProjectPreview(item.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <SectionHeader
                  title="Achievement"
                  onEdit={() => {
                    setAchievementEditingId(null);
                    setAchievementDirectEditMode(false);
                    setOpenDialog(DialogID.ACHIEVEMENT);
                  }}
                />
                <div
                  className={`mt-3 space-y-3 ${
                    achievements.length > 3
                      ? "max-h-[300px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
                  {achievements.map((item) => (
                    <CardItem
                      key={item.id}
                      title={item.name}
                      subtitle={item.from}
                      meta={formatDisplayDate(item.date)}
                      subtitleClassName="line-clamp-4 whitespace-pre-line break-words"
                      onClick={() => handleOpenAchievementPreview(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="hidden lg:block">
                <SkillApplicationSection
                  skills={userSkills}
                  applications={applications}
                  isLoadingApplications={isLoadingProfile}
                  onNewSkill={() => setOpenDialog(DialogID.SKILL_ADD)}
                  onOpenSkillInfo={handleOpenSkillInfo}
                />
              </div>
            </div>
          </div>
        </div>

        {editingImage && editingTarget ? (
          <ImageEditor
            open={openOverlayDialog === OverlayDialogID.IMAGE_EDITOR}
            image={editingImage}
            outputSize={
              editingTarget === "banner"
                ? { w: 1411, h: 275 }
                : { w: 320, h: 320 }
            }
            onClose={handleCloseEditor}
            onSave={handleSaveImage}
          />
        ) : null}

        <ProfileDialog
          key={DialogID.PROFILE_EDIT}
          open={openDialog === DialogID.PROFILE_EDIT}
          onClose={() => setOpenDialog(null)}
          onSave={handleSaveProfile}
          initialData={profileForm}
        />

        <AboutDialog
          key={DialogID.ABOUT}
          open={openDialog === DialogID.ABOUT}
          initialValue={aboutText}
          onClose={() => setOpenDialog(null)}
          onSave={handleSaveAbout}
        />

        <AddskillDialog
          open={openDialog === DialogID.SKILL_ADD}
          onClose={() => setOpenDialog(null)}
          existingSkills={userSkills}
          onAddSkill={handleAddProfileSkill}
          onRemoveSkill={handleRemoveProfileSkill}
          showSkillsList
          enableSkillExam
        />

        <EducateDialog
          key={DialogID.EDUCATION}
          open={openDialog === DialogID.EDUCATION}
          initialData={education}
          onClose={() => setOpenDialog(null)}
          onSave={handleSaveEducation}
        />

        <WorkexpDialog
          key={DialogID.WORK_EXPERIENCE}
          open={openDialog === DialogID.WORK_EXPERIENCE}
          initialData={workExperience}
          onClose={() => setOpenDialog(null)}
          onSave={handleSaveWorkExperience}
        />

        <AchievementDialog
          key={DialogID.ACHIEVEMENT}
          open={openDialog === DialogID.ACHIEVEMENT}
          initialData={achievements}
          initialEditingId={achievementEditingId}
          directEditMode={achievementDirectEditMode}
          onClose={() => {
            setOpenDialog(null);
            setAchievementEditingId(null);
            setAchievementDirectEditMode(false);
          }}
          onSave={async (items) => {
            await handleSaveAchievements(items);
            setAchievementEditingId(null);
            setAchievementDirectEditMode(false);
          }}
        />

        <ProjectDialog
          key={DialogID.PROJECT}
          open={openDialog === DialogID.PROJECT}
          initialData={projects}
          initialEditingId={projectEditingId}
          directEditMode={projectDirectEditMode}
          onClose={() => {
            setOpenDialog(null);
            setProjectEditingId(null);
            setProjectDirectEditMode(false);
          }}
          onSave={async (items) => {
            await handleSaveProjects(items);
            setProjectEditingId(null);
            setProjectDirectEditMode(false);
          }}
        />

        {openDialog === DialogID.PROJECT_PREVIEW && previewProject ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {previewProject.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {previewProject.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDialog(null);
                    setPreviewProjectId(null);
                  }}
                  className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
                  aria-label="Close project preview"
                >
                  <CgClose className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScrollProjectImages("left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
                  aria-label="Previous images"
                >
                  {"<"}
                </button>
                <div
                  ref={projectImageListRef}
                  className="flex flex-1 gap-3 overflow-x-auto scroll-smooth"
                >
                  {previewProject.images.length > 0 ? (
                    previewProject.images.map((image, idx) => (
                      <img
                        key={`${image}-${idx}`}
                        src={image}
                        alt={`Project image ${idx + 1}`}
                        className="h-[280px] w-[240px] shrink-0 rounded-xl object-cover"
                      />
                    ))
                  ) : (
                    <div className="flex h-[280px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                      No images uploaded
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleScrollProjectImages("right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
                  aria-label="Next images"
                >
                  {">"}
                </button>
              </div>

              <p className="mb-3 whitespace-pre-line break-all text-sm leading-relaxed text-slate-700">
                {previewProject.description}
              </p>

              <div>
                <h3 className="mb-2 text-base font-medium text-slate-900">
                  Skill use
                </h3>
                <div className="flex flex-wrap gap-2">
                  {previewProject.skills.length > 0 ? (
                    previewProject.skills.map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => handleOpenSkillInfo(skill)}
                        className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                      >
                        {skill}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">No skills</span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setProjectEditingId(previewProject.id);
                    setProjectDirectEditMode(true);
                    setOpenDialog(DialogID.PROJECT);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <RiPencilFill className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {openDialog === DialogID.ACHIEVEMENT_PREVIEW && previewAchievement ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {previewAchievement.name}
                  </h2>
                  <p className="text-sm text-slate-700">
                    {previewAchievement.from}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDisplayDate(previewAchievement.date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDialog(null);
                    setPreviewAchievementId(null);
                  }}
                  className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
                  aria-label="Close achievement preview"
                >
                  <CgClose className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScrollAchievementImages("left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
                  aria-label="Previous achievement images"
                >
                  {"<"}
                </button>
                <div
                  ref={achievementImageListRef}
                  className="flex flex-1 gap-3 overflow-x-auto scroll-smooth"
                >
                  {previewAchievement.images.length > 0 ? (
                    previewAchievement.images.map((image, idx) => (
                      <img
                        key={`${image}-${idx}`}
                        src={image}
                        alt={`Achievement image ${idx + 1}`}
                        className="h-[280px] w-[240px] shrink-0 rounded-xl object-cover"
                      />
                    ))
                  ) : (
                    <div className="flex h-[280px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                      No images uploaded
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleScrollAchievementImages("right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
                  aria-label="Next achievement images"
                >
                  {">"}
                </button>
              </div>

              <p className="mb-3 whitespace-pre-line break-all text-sm leading-relaxed text-slate-700">
                {previewAchievement.description || "No description."}
              </p>

              <div>
                <h3 className="mb-2 text-base font-medium text-slate-900">
                  Skill use
                </h3>
                <div className="flex flex-wrap gap-2">
                  {previewAchievement.skills.length > 0 ? (
                    previewAchievement.skills.map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => handleOpenSkillInfo(skill)}
                        className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                      >
                        {skill}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">No skills</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAchievementEditingId(previewAchievement.id);
                    setAchievementDirectEditMode(true);
                    setOpenDialog(DialogID.ACHIEVEMENT);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <RiPencilFill className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <SkillinfoDialog
          open={openOverlayDialog === OverlayDialogID.SKILL_INFO}
          onClose={() => setOpenOverlayDialog(null)}
          skillName={selectedSkillName}
        />
      </div>
    </PageLayout>
  );
}
