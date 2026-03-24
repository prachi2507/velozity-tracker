import React, { useRef } from 'react';
import { useTask } from '../context/TaskContext';

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981'
};

export default function TimelineView() {
  const { filteredTasks } = useTask();
  const containerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDay = now.getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const DAY_WIDTH = 40;
  const ROW_HEIGHT = 44;
  const LABEL_WIDTH = 160;

  function dateToDay(dateStr: string): number {
    const d = new Date(dateStr);
    if (d.getMonth() !== month || d.getFullYear() !== year) {
      return d < now ? 1 : daysInMonth;
    }
    return d.getDate();
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '14px' }}>
        📅 Timeline — {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>

      <div style={{ overflowX: 'auto' }} ref={containerRef}>
        <div style={{ minWidth: `${LABEL_WIDTH + DAY_WIDTH * daysInMonth}px` }}>

          {/* Day headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
            <div style={{ width: `${LABEL_WIDTH}px`, flexShrink: 0, padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#6b7280' }}>
              Task
            </div>
            {days.map(d => (
              <div key={d} style={{
                width: `${DAY_WIDTH}px`, flexShrink: 0, textAlign: 'center',
                padding: '8px 0', fontSize: '11px', fontWeight: d === todayDay ? 700 : 400,
                color: d === todayDay ? '#6366f1' : '#6b7280',
                background: d === todayDay ? '#ede9fe' : 'transparent'
              }}>{d}</div>
            ))}
          </div>

          {/* Task rows */}
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {filteredTasks.slice(0, 100).map((task, i) => {
              const startDay = task.startDate ? dateToDay(task.startDate) : dateToDay(task.dueDate);
              const endDay = dateToDay(task.dueDate);
              const left = LABEL_WIDTH + (startDay - 1) * DAY_WIDTH;
              const width = Math.max(DAY_WIDTH, (endDay - startDay + 1) * DAY_WIDTH);

              return (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center',
                  height: `${ROW_HEIGHT}px`,
                  borderBottom: '1px solid #f3f4f6',
                  background: i % 2 === 0 ? 'white' : '#fafafa',
                  position: 'relative'
                }}>
                  {/* Task label */}
                  <div style={{
                    width: `${LABEL_WIDTH}px`, flexShrink: 0,
                    padding: '0 12px', fontSize: '12px', fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: '#111827'
                  }}>
                    {task.title}
                  </div>

                  {/* Day cells background */}
                  <div style={{ display: 'flex', position: 'absolute', left: `${LABEL_WIDTH}px`, top: 0, bottom: 0 }}>
                    {days.map(d => (
                      <div key={d} style={{
                        width: `${DAY_WIDTH}px`, flexShrink: 0, height: '100%',
                        background: d === todayDay ? '#ede9fe22' : 'transparent',
                        borderRight: '1px solid #f3f4f6'
                      }} />
                    ))}
                  </div>

                  {/* Task bar */}
                  <div style={{
                    position: 'absolute',
                    left: `${left}px`,
                    width: `${width}px`,
                    height: '24px',
                    borderRadius: '6px',
                    background: PRIORITY_COLORS[task.priority],
                    opacity: 0.85,
                    display: 'flex', alignItems: 'center',
                    paddingLeft: '8px',
                    fontSize: '11px', color: 'white', fontWeight: 600,
                    overflow: 'hidden', whiteSpace: 'nowrap',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}>
                    {width > 60 ? task.title : ''}
                  </div>

                  {/* Today line */}
                  <div style={{
                    position: 'absolute',
                    left: `${LABEL_WIDTH + (todayDay - 1) * DAY_WIDTH + DAY_WIDTH / 2}px`,
                    top: 0, bottom: 0, width: '2px',
                    background: '#6366f1', opacity: 0.5, zIndex: 5
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}