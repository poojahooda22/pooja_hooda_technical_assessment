// useKeyboardShortcuts.ts — Blender-inspired keyboard shortcuts
// Ctrl+Z = undo, Ctrl+Shift+Z = redo, Ctrl+A = select all
// Space = pan mode (hold Space + left-drag to pan, like Figma/Photoshop)
// Guards: skip if focus is inside INPUT/TEXTAREA (don't hijack text editing)

import { useEffect, useState } from 'react';
import { useStore } from '../store';

interface ShortcutOptions {
  onToggleAddMenu?: () => void;
}

export const useKeyboardShortcuts = (options?: ShortcutOptions): { isSpaceHeld: boolean } => {
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);

  useEffect(() => {
    const isTypingElement = (): boolean => {
      const active = document.activeElement;
      return (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      );
    };

    const onKeyDown = (e: KeyboardEvent): void => {
      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (isTypingElement()) return;
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        if (isTypingElement()) return;
        e.preventDefault();
        redo();
        return;
      }

      // Shift+A = Toggle Add Node menu (Blender-style)
      if (e.shiftKey && e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey) {
        if (isTypingElement()) return;
        e.preventDefault();
        e.stopPropagation();
        options?.onToggleAddMenu?.();
        return;
      }

      // Ctrl+A / Cmd+A = Select all nodes
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        if (isTypingElement()) return;
        e.preventDefault();
        const { nodes, onNodesChange } = useStore.getState();
        onNodesChange(
          nodes.map((n) => ({ id: n.id, type: 'select' as const, selected: true }))
        );
        return;
      }

      // Space = pan mode (hold to activate)
      // CRITICAL: Always preventDefault for Space on canvas to stop it from
      // typing into unfocused node input fields. Only allow if user explicitly
      // clicked into an input/textarea.
      if (e.key === ' ' && !e.repeat) {
        if (isTypingElement()) return;
        e.preventDefault();
        e.stopPropagation();
        setIsSpaceHeld(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      if (e.key === ' ') {
        if (!isTypingElement()) {
          e.preventDefault();
          e.stopPropagation();
        }
        setIsSpaceHeld(false);
      }
    };

    // Use capture phase to intercept Space BEFORE ReactFlow or node inputs handle it
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('keyup', onKeyUp, true);
    };
  }, [undo, redo, options]);

  return { isSpaceHeld };
};
