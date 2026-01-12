// src/store/index.ts
export { useDataStore } from './dataStore';
export { useUIStore } from './uiStore';

// 便捷的选择器 hooks
export const useTickets = () => useDataStore((state) => state.tickets);
export const useTemplates = () => useDataStore((state) => state.templates);
export const useSites = () => useDataStore((state) => state.sites);
export const useGroups = () => useDataStore((state) => state.groups);
export const useUsers = () => useDataStore((state) => state.users);
export const useSLAConfigs = () => useDataStore((state) => state.slaConfigs);
export const useProblemTypes = () => useDataStore((state) => state.problemTypes);
export const useSiteLevelConfigs = () => useDataStore((state) => state.siteLevelConfigs);
