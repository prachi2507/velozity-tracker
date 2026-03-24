import React from 'react';
import { TaskProvider } from './context/TaskContext';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <TaskProvider>
      <MainLayout />
    </TaskProvider>
  );
}

export default App;