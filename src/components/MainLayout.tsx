import React from 'react';
import TimelineView from './TimelineView';
import { useTask } from '../context/TaskContext';
import FilterBar from './FilterBar';
import KanbanView from './KanbanView';
import ListView from './ListView';
import CollabBar from './CollabBar';

export default function MainLayout() {
  const { state, dispatch } = useTask();

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ background: '#1e1b4b', color: 'white', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>⚡ Velozity Tracker</h1>
        <CollabBar />
      </div>

      {/* View Switcher */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '8px 24px', display: 'flex', gap: '8px' }}>
        {(['kanban', 'list', 'timeline'] as const).map(v => (
          <button
            key={v}
            onClick={() => dispatch({ type: 'SET_VIEW', view: v })}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              background: state.view === v ? '#6366f1' : '#f3f4f6',
              color: state.view === v ? 'white' : '#374151',
              textTransform: 'capitalize'
            }}
          >
            {v === 'kanban' ? '🗂 Kanban' : v === 'list' ? '📋 List' : '📅 Timeline'}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Views */}
      <div style={{ padding: '16px 24px' }}>
        {state.view === 'kanban' && <KanbanView />}
        {state.view === 'list' && <ListView />}
        {state.view === 'timeline' && <TimelineView />}
      </div>
    </div>
  );
}