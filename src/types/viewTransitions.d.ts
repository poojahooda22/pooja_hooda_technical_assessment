// View Transitions API type declarations
// Chrome 111+, Edge 111+, Safari 18+. Firefox: not supported (graceful fallback).

interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
}

interface Document {
  startViewTransition?(callback: () => void | Promise<void>): ViewTransition;
}
