export const navigationStates = [
  "greeting",
  "hand",
  "shuffle",
  "fan",
  "selected",
  "hero",
  "about",
  "gamemode_entry",
  "gamemode_ride",
  "gamemode_stall",
  "gamemode_exit",
] as const;

export type NavigationState = (typeof navigationStates)[number];

export const navigationTransitions: Record<NavigationState, readonly NavigationState[]> = {
  greeting: ["hand", "hero"],
  hand: ["shuffle"],
  shuffle: ["fan"],
  fan: ["selected"],
  selected: ["hero"],
  hero: ["about", "gamemode_entry"],
  about: ["hero", "gamemode_entry"],
  gamemode_entry: ["gamemode_ride", "gamemode_exit"],
  gamemode_ride: ["gamemode_stall", "gamemode_exit"],
  gamemode_stall: ["gamemode_exit"],
  gamemode_exit: ["hero"],
};

export type NavigationAction = {
  type: "transition";
  next: NavigationState;
};

export function canTransition(from: NavigationState, to: NavigationState) {
  return navigationTransitions[from].includes(to);
}

export function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  if (!canTransition(state, action.next)) {
    console.warn(`[Navigation machine] Ignored invalid transition: ${state} -> ${action.next}`);
    return state;
  }

  console.info(`[Navigation machine] ${state} -> ${action.next}`);
  return action.next;
}

declare global {
  interface Window {
    __portfolioNavigation?: {
      state: NavigationState;
      transition: (next: NavigationState) => void;
    };
  }
}
