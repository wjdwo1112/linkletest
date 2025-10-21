import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // 상태
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      currentClubId: null,
      currentClubRole: null,

      // 액션
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setCurrentClub: (clubId, role) =>
        set({
          currentClubId: clubId,
          currentClubRole: role,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          currentClubId: null,
          currentClubRole: null,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setError: (error) =>
        set({
          error,
          isLoading: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // 헬퍼 함수들
      isLoggedIn: () => get().isAuthenticated,
      getUserId: () => get().user?.id,
      getUserName: () => get().user?.name,
      getCurrentClubId: () => get().currentClubId,
      getCurrentClubRole: () => get().currentClubRole,
      isClubLeader: () => get().currentClubRole === 'LEADER',
      isClubManager: () =>
        get().currentClubRole === 'LEADER' || get().currentClubRole === 'MANAGER',
    }),
    {
      name: 'user-storage', // 로컬스토리지 키
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentClubId: state.currentClubId,
        currentClubRole: state.currentClubRole,
      }), // 저장할 상태만 선택
    },
  ),
);

export default useUserStore;
