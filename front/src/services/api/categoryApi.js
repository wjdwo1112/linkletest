import { get } from '../apiClient';

export const categoryApi = {
  // 카테고리 계층 구조 조회
  getCategoriesHierarchy: async () => {
    return await get('/categories/hierarchy');
  },

  // 2차 카테고리만 조회
  getChildCategories: async () => {
    return await get('/categories/children');
  },
};
