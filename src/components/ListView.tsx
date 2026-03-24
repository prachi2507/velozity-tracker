import React, { useState, useRef, useCallback } from 'react';
import { useTask, SortField } from '../context/TaskContext';
import { Status } from '../types';

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981'
};
const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];
const ROW_HEIGHT = 48;
const BUFFER = 5;

function formatDueDate(dueDate: string): { label: string; color: string } {
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dueDate); due.setHours(0,0,0,0);
  const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return { label: 'Due Today', color: '#f59e0b' };
  if (diff < -7) return { label: `${Math.abs(diff)}d overdue`, color: '#ef4444' };
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: '#ef4444' };
  return { label: dueDate, color: '#6b7280' };
}

export default function ListView() {
  const { filteredTasks, dispatch, state, users } = useTask();
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const VISIBLE_HEIGHT = 500;

  const totalHeight = filteredTasks.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const endIndex = Math.min(
    filteredTasks.length - 1,
    Math.floor((scrollTop + VISIBLE_HEIGHT) / ROW_HEIGHT) + BUFFER
  );
  const visibleTasks = filteredTasks.slice(startIndex, endIndex + 1);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    const active = state.sortField === field;
    return (
      <th
        onClick={() => dispatch({ type: 'SET_SORT', field })}
        style={{
          padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
          background: active ? '#ede9fe' : '#f9fafb',
          color: active ? '#6366f1' : '#374151',
          fontWeight: 700, fontSize: '13px',
          userSelect: 'none', whiteSpace: 'nowrap',
          borderBottom: '2px solid #e5e7eb'
        }}
      >
        {label} {active ? (state.sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </th>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>
        <div style={{ fontSize: '48px' }}>🔍</div>
        <div style={{ fontSize: '18px', marginTop: '12px', fontWeight: 600 }}>No tasks found</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters</div>
        <button
          onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
          style={{
            marginTop: '16px', padding: '8px 20px', borderRadius: '8px',
            border: 'none', background: '#6366f1', color: 'white',
            cursor: 'pointer', fontWeight: 600
          }}
        >Clear Filters</button>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      {/* Total count */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', color: '#6b7280' }}>
        Showing <strong>{filteredTasks.length}</strong> tasks
      </div>

      {/* Table Header */}
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '35%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '15%' }} />
        </colgroup>
        <thead>
          <tr>
            <SortHeader field="title" label="Title" />
            <SortHeader field="priority" label="Priority" />
            <SortHeader field="dueDate" label="Due Date" />
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: '13px', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>Assignee</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: '13px', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>Status</th>
          </tr>
        </thead>
      </table>

      {/* Virtual Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: `${VISIBLE_HEIGHT}px`, overflowY: 'auto', position: 'relative' }}
      >
        {/* Full height spacer */}
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {/* Only visible rows rendered */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', position: 'absolute', top: `${startIndex * ROW_HEIGHT}px`, left: 0, right: 0 }}>
            <colgroup>
              <col style={{ width: '35%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <tbody>
              {visibleTasks.map((task, i) => {
                const user = users.find(u => u.id === task.assigneeId);
                const due = formatDueDate(task.dueDate);
                const isEven = (startIndex + i) % 2 === 0;
                return (
                  <tr key={task.id} style={{ background: isEven ? 'white' : '#fafafa', height: `${ROW_HEIGHT}px` }}>
                    <td style={{ padding: '0 16px', fontSize: '13px', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </td>
                    <td style={{ padding: '0 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                        background: PRIORITY_COLORS[task.priority] + '20',
                        color: PRIORITY_COLORS[task.priority]
                      }}>{task.priority}</span>
                    </td>
                    <td style={{ padding: '0 16px', fontSize: '12px', color: due.color, fontWeight: 500 }}>
                      {due.label}
                    </td>
                    <td style={{ padding: '0 16px' }}>
                      {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: user.color, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 700, flexShrink: 0
                          }}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span style={{ fontSize: '12px', color: '#374151' }}>{user.name}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0 16px' }}>
                      <select
                        value={task.status}
                        onChange={e => dispatch({ type: 'SET_TASK_STATUS', taskId: task.id, status: e.target.value as Status })}
                        style={{
                          padding: '4px 8px', borderRadius: '6px', fontSize: '12px',
                          border: '1px solid #d1d5db', background: 'white', cursor: 'pointer'
                        }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}