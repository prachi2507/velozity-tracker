import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';

const NAMES = ['Alex', 'Sara', 'Mike', 'Priya'];
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'];

interface ActiveUser {
  name: string;
  color: string;
  taskId: string;
}

export default function CollabBar() {
  const { filteredTasks } = useTask();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    if (filteredTasks.length === 0) return;
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 2;
      setActiveUsers(
        NAMES.slice(0, count).map((name, i) => ({
          name,
          color: COLORS[i],
          taskId: filteredTasks[Math.floor(Math.random() * Math.min(10, filteredTasks.length))].id
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [filteredTasks]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', opacity: 0.8 }}>
        👥 {activeUsers.length} people viewing
      </span>
      <div style={{ display: 'flex' }}>
        {activeUsers.map((u, i) => (
          <div key={u.name} style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: u.color, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700,
            marginLeft: i > 0 ? '-6px' : '0',
            border: '2px solid #1e1b4b',
            transition: 'all 0.3s ease'
          }}>
            {u.name[0]}
          </div>
        ))}
      </div>
    </div>
  );
}