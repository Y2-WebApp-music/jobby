import BaseService from "./BaseService";

const ApiService = {
  fetchData(param: any): Promise<any> {
    return BaseService(param);
  },
};

export default ApiService;
