import { create } from "zustand";

/**
 * RefreshState
 *
 * Global store for the navbar's central "soft refresh" mechanism.
 * Instead of a full browser reload, pages subscribe to `refreshKey`
 * changes which trigger React remounts via key-prop diffing.
 *
 * - `refreshKey`: Monotonically incrementing counter used as a React key.
 *   When it changes, React unmounts and remounts the page component,
 *   causing all useEffect hooks to naturally re-fire.
 * - `isRefreshing`: Tracks whether a refresh cycle is in progress,
 *   used by the navbar to show a spinning animation on the refresh icon.
 */
interface RefreshState {
  refreshKey: number;
  isRefreshing: boolean;
  triggerRefresh: () => void;
  markRefreshComplete: () => void;
}

export const useRefreshStore = create<RefreshState>((set, get) => ({
  refreshKey: 0,
  isRefreshing: false,

  /**
   * Increment the key to signal all mounted page components to remount.
   * Auto-resets isRefreshing after 600ms as a safety net for routes
   * that don't pass through HandleDynamicView (e.g. /myApps, /profile).
   */
  triggerRefresh: () => {
    set((state) => ({
      refreshKey: state.refreshKey + 1,
      isRefreshing: true,
    }));

    setTimeout(() => {
      get().markRefreshComplete();
    }, 600);
  },

  /** Called to stop the navbar spinner animation */
  markRefreshComplete: () => set({ isRefreshing: false }),
}));
