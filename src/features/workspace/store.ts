import { create } from 'zustand';
import type { Workspace } from './types';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  currentRole: string | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentRole: (role: string | null) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  currentRole: null,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setCurrentRole: (role) => set({ currentRole: role }),
  clearWorkspace: () => set({ currentWorkspace: null, currentRole: null }),
}));
