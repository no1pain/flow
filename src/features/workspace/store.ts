import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from './types';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  currentRole: string | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentRole: (role: string | null) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspace: null,
      currentRole: null,
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setCurrentRole: (role) => set({ currentRole: role }),
      clearWorkspace: () => set({ currentWorkspace: null, currentRole: null }),
    }),
    {
      name: 'workspace-storage',
    }
  )
);
