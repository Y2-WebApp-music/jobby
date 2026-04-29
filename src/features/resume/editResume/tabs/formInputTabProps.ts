import type { ResumeCreateProps } from "@/types/resumeType";
import dayjs from "dayjs";

export type FormInputTabProps = {
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

export const formatMonthYear = (value?: Date | string) => {
  if (!value) return "";
  const d = dayjs(typeof value === "string" ? new Date(value) : value);
  return d.isValid() ? d.format("MMM YYYY") : "";
};

export const updateListItem = <T, K extends keyof T>(
  list: T[],
  index: number,
  key: K,
  value: T[K],
) =>
  list.map((item, idx) => (idx === index ? { ...item, [key]: value } : item));

export const removeListItem = <T>(list: T[], index: number) =>
  list.filter((_, idx) => idx !== index);
