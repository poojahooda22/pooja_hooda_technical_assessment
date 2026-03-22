// SubmitButton.tsx — Submit pipeline to backend with design system Toast notification

import { useState, useCallback } from 'react';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { Loader2 } from 'lucide-react';
import { RainbowButton } from './RainbowButton';
import { Toast } from './Toast';
import { API_BASE_URL } from '../constants/api';
import type { StoreState } from '../types/store';
import type { ToastColor } from './Toast';

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
  const [toastOpen, setToastOpen] = useState(false);
  const [toastData, setToastData] = useState<{
    color: ToastColor;
    title: string;
    description: string;
  }>({ color: 'success', title: '', description: '' });

  const handleOpenChange = useCallback((open: boolean) => setToastOpen(open), []);

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      // Filter out orphaned edges (source/target node no longer exists)
      const nodeIds = new Set(nodes.map((n) => n.id));
      const validEdges = edges.filter(
        (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
      );

      const response = await fetch(`${API_BASE_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges: validEdges }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: PipelineResponse = await response.json();
      console.table(data);
      markClean();

      if (data.is_dag) {
        setToastData({
          color: 'success',
          title: 'Pipeline Analysis',
          description: `Nodes: ${data.num_nodes}  |  Edges: ${data.num_edges}  |  DAG: Yes`,
        });
      } else {
        setToastData({
          color: 'warning',
          title: 'Pipeline Has Cycles',
          description: `Nodes: ${data.num_nodes}  |  Edges: ${data.num_edges}  |  DAG: No — contains cycles`,
        });
      }
      setToastOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setToastData({
        color: 'error',
        title: 'Submission Failed',
        description: message,
      });
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <RainbowButton
          onClick={handleSubmit}
          disabled={loading || !isDirty || nodes.length === 0}
          size="sm"
          className="focus-visible:shadow-focus-ring-brand-xs focus-visible:outline-none"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>{loading ? 'Analyzing...' : 'Submit Pipeline'}</span>
        </RainbowButton>
      </div>

      <Toast
        color={toastData.color}
        size="sm"
        title={toastData.title}
        description={toastData.description}
        position="top-right"
        open={toastOpen}
        onOpenChange={handleOpenChange}
        autoHideDuration={5000}
        showClose
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};
