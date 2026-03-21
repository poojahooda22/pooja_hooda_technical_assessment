// SubmitButton.tsx — Submit pipeline to backend with Sonner toast notification

import { useState } from 'react';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../constants/api';
import type { StoreState } from '../types/store';

interface PipelineResponse {
  num_nodes: number;
  num_edges: number;
  is_dag: boolean;
}

const selector = (state: StoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  isDirty: state.isDirty,
  markClean: state.markClean,
});

export const SubmitButton = () => {
  const { nodes, edges, isDirty, markClean } = useStore(selector, shallow);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: PipelineResponse = await response.json();

      // Console output for debugging visibility
      console.table(data);

      // Sonner toast notification
      // Mark pipeline as clean (disables button until next change)
      markClean();

      if (data.is_dag) {
        toast.success('Pipeline Analysis', {
          description: `Nodes: ${data.num_nodes}  |  Edges: ${data.num_edges}  |  DAG: Yes`,
          duration: 5000,
        });
      } else {
        toast.warning('Pipeline Has Cycles', {
          description: `Nodes: ${data.num_nodes}  |  Edges: ${data.num_edges}  |  DAG: No -- contains cycles`,
          duration: 7000,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Submission Failed', {
        description: message,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={handleSubmit}
        disabled={loading || !isDirty || nodes.length === 0}
        className="inline-flex items-center justify-center gap-md h-9 px-xl
                   text-sm font-semibold rounded-xl shadow-xs
                   bg-background-brand-solid text-fg-white
                   hover:bg-background-brand-solid-hover hover:scale-[1.02]
                   active:scale-[0.97] motion-reduce:hover:scale-100 motion-reduce:active:scale-100
                   focus-visible:shadow-focus-ring-brand-xs focus-visible:outline-none
                   disabled:pointer-events-none disabled:opacity-50
                   transition-all duration-200 border border-transparent cursor-pointer"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        <span>{loading ? 'Analyzing...' : 'Submit Pipeline'}</span>
      </button>
    </div>
  );
};
