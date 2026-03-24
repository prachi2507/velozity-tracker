import React, { useRef, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { Status, Task } from '../types';

const COLUMNS: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];
const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981'
};
const COLUMN_COLORS: Record<string, string> = {
  'To Do': '#6366f1', 'In Progress': '#f59e0b', 'In Review': '#3b82f6', 'Done': '#10b981'
};

function formatDueDate(dueDate: string): { label: string; color: string } {
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dueDate); due.setHours(0,0,0,0);
  const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return { label: 'Due Today', color: '#f59e0b' };
  if (diff < -7) return { label: `${Math.abs(diff)}d overdue`, color: '#ef4444' };
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: '#ef4444' };
  return { label: dueDate, color: '#6b7280' };
}

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div style={{
      width: '24px', height: '24px', borderRadius: '50%',
      background: color, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', fontWeight: 700
    }}>{initials}</div>
  );
}

function TaskCard({
  task, onDragStart, isDragging, onDragEnd
}: {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  isDragging: boolean;
  onDragEnd: () => void;
}) {
  const { users } = useTask();
  const user = users.find(u => u.id === task.assigneeId);
  const due = formatDueDate(task.dueDate);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      style={{
        background: 'white',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        border: '1px solid #e5e7eb',
        transition: 'box-shadow 0.2s'
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
        {task.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
          background: PRIORITY_COLORS[task.priority] + '20',
          color: PRIORITY_COLORS[task.priority]
        }}>{task.priority}</span>
        {user && <Avatar name={user.name} color={user.color} />}
      </div>
      <div style={{ marginTop: '6px', fontSize: '11px', color: due.color, fontWeight: 500 }}>
        📅 {due.label}
      </div>
    </div>
  );
}

export default function KanbanView() {
  const { filteredTasks, dispatch } = useTask();
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);
  const dragTask = useRef<Task | null>(null);

  function handleDragStart(e: React.DragEvent, task: Task) {
    dragTask.current = task;
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, status: Status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverColumn(status);
  }

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault();
    if (dragTask.current) {
      dispatch({ type: 'MOVE_TASK', taskId: dragTask.current.id, status });
    }
    setDraggingTask(null);
    setOverColumn(null);
    dragTask.current = null;
  }

  function handleDragEnd() {
    setDraggingTask(null);
    setOverColumn(null);
    dragTask.current = null;
  }

  return (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
      {COLUMNS.map(col => {
        const colTasks = filteredTasks.filter(t => t.status === col);
        const isOver = overColumn === col;
        return (
          <div
            key={col}
            onDragOver={e => handleDragOver(e, col)}
            onDrop={e => handleDrop(e, col)}
            onDragLeave={() => setOverColumn(null)}
            style={{
              flex: '0 0 280px',
              background: isOver ? '#ede9fe' : '#f9fafb',
              borderRadius: '12px',
              padding: '12px',
              border: `2px solid ${isOver ? '#6366f1' : 'transparent'}`,
              transition: 'all 0.2s',
              minHeight: '400px',
              maxHeight: '75vh',
              overflowY: 'auto'
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLUMN_COLORS[col] }} />
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{col}</span>
              </div>
              <span style={{
                background: COLUMN_COLORS[col] + '20', color: COLUMN_COLORS[col],
                borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: 700
              }}>{colTasks.length}</span>
            </div>

            {/* Tasks */}
            {colTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af' }}>
                <div style={{ fontSize: '32px' }}>📭</div>
                <div style={{ fontSize: '13px', marginTop: '8px' }}>No tasks here</div>
              </div>
            ) : (
              colTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  isDragging={draggingTask?.id === task.id}
                  onDragEnd={handleDragEnd}
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}