import { PipelineToolbar } from './components/PipelineToolbar';
import { PipelineCanvas } from './components/PipelineCanvas';
import { SubmitButton } from './components/SubmitButton';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="h-screen flex flex-col">
      <PipelineToolbar />
      <PipelineCanvas />
      <SubmitButton />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
