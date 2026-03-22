import { ReactFlowProvider } from 'reactflow';
import { PipelineToolbar } from './components/PipelineToolbar';
import { PipelineCanvas } from './components/PipelineCanvas';
import { SubmitButton } from './components/SubmitButton';

function App() {
  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col">
        <PipelineToolbar />
        <PipelineCanvas />
        <SubmitButton />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
