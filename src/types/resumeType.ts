import type { AddressProps, SkillProps } from "./globalTypes";

export type ContactProps = {
  label: string;
  link: string;
};

export type EducationProps = {
  id?: string;
  school_name: string;
  logo: File | string;
  degree: string;
  field_of_study: string;
  start_date: Date | string;
  end_date: Date | string;
  gpax: number;
};

export type WorkExperienceProps = {
  id?: string;
  position: string;
  logo: File | string;
  company_name: string;
  start_date: Date | string;
  end_Date: Date | string;
  skills: SkillProps[];
  work_type: string;
  work_type_id: number;
};

export type ProjectProps = {
  id?: string;
  name: string;
  description: string;
  start_date: Date | string;
  end_date: Date | string;
  skills: SkillProps[];
  images: {
    index: number;
    image: File | string;
  }[];
};

export type AchievementProps = {
  id?: string;
  name: string;
  project_name: string;
  description: string;
  date: Date | string;
  skills: SkillProps[];
  images: {
    index: number;
    image: File | string;
  }[];
};

export type LanguageProps = {
  label: string;
  level: number;
};

export type ResumeListItem = {
  id: string;
  name: string;
  create_date: string;
  theme?: number;
  color?: number;
  resume_file?: string | null;
};

export type ResumeCreateProps = {
  id?: string;
  name: string;
  create_date?: string;
  theme: number;
  color: number;
  resume_file?: string;
  resume_file_metadata?: Record<string, unknown> | null;
  data: {
    first_name: string;
    last_name: string;
    logo: File | string;
    phone: string;
    phone_region: number | string;
    email: string;
    contact: {
      label: string;
      link: string;
    }[];
    skills: SkillProps[];
    address: AddressProps;
    education: EducationProps[];
    work_experience: WorkExperienceProps[];
    projects: ProjectProps[];
    achievement: AchievementProps[];
    miscellaneous: {
      label: string;
      data: string;
    }[];
  };
};

export const initialResume: ResumeCreateProps = {
  name: "",
  theme: 1,
  color: 0,
  resume_file: "",
  resume_file_metadata: null,
  data: {
    first_name: "",
    last_name: "",
    logo: "",
    phone: "",
    phone_region: 0,
    email: "",
    contact: [],
    skills: [],
    address: {
      address_line: "",
      no: "",
      moo: "",
      soi: "",
      street: "",
      sub_district: "",
      sub_district_th: "",
      sub_district_eng: "",
      district: "",
      district_th: "",
      district_eng: "",
      province: "",
      province_th: "",
      province_eng: "",
      country: "",
      country_th: "",
      country_eng: "",
      sub_district_id: 0,
      district_id: 0,
      province_id: 0,
      country_id: 0,
      postal_code: 0,
    },
    education: [],
    work_experience: [],
    projects: [],
    achievement: [],
    miscellaneous: [],
  },
};
