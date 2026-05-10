import apiService from "./apiService";

export type SkillDetail = {
  skillElementId: string;
  name: string;
  description: string | null;
};

export type RelatedSkillItem = {
  skillElementId: string;
  relType: string;
  name: string;
};

export type SkillDetailResponse = {
  skill: SkillDetail;
  related_skills: RelatedSkillItem[];
};

export const SKILL_DETAIL_ENDPOINT = "/graph/skills";

export const getSkillDetail = (skillId: string) => {
  return apiService.fetchData<SkillDetailResponse>({
    url: `${SKILL_DETAIL_ENDPOINT}/${encodeURIComponent(skillId)}`,
    method: "get",
  });
};

const skillDetailService = {
  getSkillDetail,
};

export default skillDetailService;
