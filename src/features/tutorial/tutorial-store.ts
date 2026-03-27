"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TutorialPage =
  | "dashboard"
  | "youtube"
  | "instagram"
  | "twitter"
  | "studio"
  | "settings"
  | "scheduler"
  | "voiceovers"
  | "ai-video";

export interface TutorialState {
  // Whether tutorials are enabled globally
  enabled: boolean;
  // Whether to show tutorial for a specific page
  activePage: TutorialPage | null;
  // Current step in the tutorial for the active page
  currentStep: number;
  // Pages that the user has completed tutorials for
  completedPages: TutorialPage[];
  // Whether the user has dismissed tutorials permanently
  dismissedGlobally: boolean;

  // Actions
  startTutorial: (page: TutorialPage) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  dismissTutorials: () => void;
  enableTutorials: () => void;
  resetTutorial: (page?: TutorialPage) => void;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      enabled: true,
      activePage: null,
      currentStep: 0,
      completedPages: [],
      dismissedGlobally: false,

      startTutorial: (page) => {
        set({
          activePage: page,
          currentStep: 0,
        });
      },

      nextStep: () => {
        set((state) => ({
          currentStep: state.currentStep + 1,
        }));
      },

      prevStep: () => {
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        }));
      },

      skipTutorial: () => {
        const { activePage } = get();
        if (activePage) {
          set((state) => ({
            activePage: null,
            currentStep: 0,
            completedPages: [...state.completedPages, activePage],
          }));
        }
      },

      completeTutorial: () => {
        const { activePage } = get();
        if (activePage) {
          set((state) => ({
            activePage: null,
            currentStep: 0,
            completedPages: state.completedPages.includes(activePage)
              ? state.completedPages
              : [...state.completedPages, activePage],
          }));
        }
      },

      dismissTutorials: () => {
        set({
          enabled: false,
          activePage: null,
          currentStep: 0,
          dismissedGlobally: true,
        });
      },

      enableTutorials: () => {
        set({
          enabled: true,
          dismissedGlobally: false,
        });
      },

      resetTutorial: (page) => {
        if (page) {
          set((state) => ({
            completedPages: state.completedPages.filter((p) => p !== page),
          }));
        } else {
          set({
            completedPages: [],
            currentStep: 0,
            activePage: null,
          });
        }
      },
    }),
    {
      name: "tutorial-storage",
    }
  )
);
