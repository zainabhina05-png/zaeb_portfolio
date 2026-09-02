export type ScrollDirection = -1 | 0 | 1;

export interface EasedScrollState {
  /** Lenis animated scroll value; native scroll in reduced-motion mode. */
  scroll: number;
  /** Normalized document progress, clamped between zero and one. */
  progress: number;
  /** Eased velocity reported by Lenis; native delta in reduced-motion mode. */
  velocity: number;
  direction: ScrollDirection;
  timestamp: number;
  /** False when the visitor requests reduced motion and native scrolling is used. */
  virtual: boolean;
  paused: boolean;
}

export type ScrollSubscriber = (state: Readonly<EasedScrollState>) => void;

const initialState: EasedScrollState = {
  scroll: 0,
  progress: 0,
  velocity: 0,
  direction: 0,
  timestamp: 0,
  virtual: false,
  paused: false,
};

/**
 * The one shared scroll clock for cinematic layers.
 * It does not own scrolling itself; SmoothScrollProvider feeds it Lenis's eased state.
 */
export class ScrollObserver {
  private subscribers = new Set<ScrollSubscriber>();
  private state: EasedScrollState = { ...initialState };

  getSnapshot = (): Readonly<EasedScrollState> => this.state;

  subscribe = (subscriber: ScrollSubscriber, emitImmediately = true) => {
    this.subscribers.add(subscriber);
    if (emitImmediately) subscriber(this.state);
    return () => this.subscribers.delete(subscriber);
  };

  publish(next: Partial<EasedScrollState>) {
    this.state = { ...this.state, ...next };
    this.subscribers.forEach((subscriber) => subscriber(this.state));
  }

  reset() {
    this.state = { ...initialState, timestamp: performance.now() };
    this.subscribers.forEach((subscriber) => subscriber(this.state));
  }
}

export const scrollObserver = new ScrollObserver();
