import apiService from "./apiService";

export type SearchSkillItem = {
  eid: string;
  name: string;
};

export type SearchSkillResponse = SearchSkillItem[];

export const SEARCH_SKILL_ENDPOINT = "/graph/skills/search";

export const getSearchSkill = (searchName: string) => {
  return apiService.fetchData<SearchSkillResponse>({
    url: `${SEARCH_SKILL_ENDPOINT}/${encodeURIComponent(searchName)}`,
    method: "get",
  });
};

const searchSkillService = {
  getSearchSkill,
};

export default searchSkillService;
