import React from 'react';
import { useTask } from '../context/TaskContext';
import { Status, Priority } from '../types';

const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];
const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export default function FilterBar() {
  const { state, dispatch, users } = useTask();
  const f = state.filters;

  const hasFilters = f.status.length > 0 || f.priority.length > 0 ||
    f.assignee.length > 0 || f.dateFrom !== '' || f.dateTo !== '';

  function toggleFilter(field: 'status' | 'priority' | 'assignee', value: string) {
    const current = f[field] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    dispatch({ type: 'SET_FILTER', filters: { [field]: updated } });
  }

  const chipStyle = (active: boolean, color?: string) => ({
    padding: '4px 10px',
    borderRadius: '999px',
    border: `1px solid ${active ? (color || '#6366f1') : '#d1d5db'}`,
    background: active ? (color || '#6366f1') : 'white',
    color: active ? 'white' : '#374151',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
  });

  return (
    <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '10px 24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>

        {/* Status */}
        {STATUSES.map(s => (
          <button key={s} style={chipStyle(f.status.includes(s))}
            onClick={() => toggleFilter('status', s)}>{s}</button>
        ))}

        <div style={{ width: '1px', height: '20px', background: '#e5e7eb' }} />

        {/* Priority */}
        {PRIORITIES.map(p => (
          <button key={p} style={chipStyle(f.priority.includes(p))}
            onClick={() => toggleFilter('priority', p)}>{p}</button>
        ))}

        <div style={{ width: '1px', height: '20px', background: '#e5e7eb' }} />

        {/* Assignees */}
        {users.map(u => (
          <button key={u.id}
            style={chipStyle(f.assignee.includes(u.id), u.color)}
            onClick={() => toggleFilter('assignee', u.id)}>
            {u.name.split(' ')[0]}
          </button>
        ))}

        <div style={{ width: '1px', height: '20px', background: '#e5e7eb' }} />

        {/* Date range */}
        <input type="date" value={f.dateFrom}
          onChange={e => dispatch({ type: 'SET_FILTER', filters: { dateFrom: e.target.value } })}
          style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }} />
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>to</span>
        <input type="date" value={f.dateTo}
          onChange={e => dispatch({ type: 'SET_FILTER', filters: { dateTo: e.target.value } })}
          style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }} />

        {/* Clear */}
        {hasFilters && (
          <button onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
            style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
            ✕ Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}