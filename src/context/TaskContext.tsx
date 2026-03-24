import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Task, Status } from '../types';
import { generateTasks, USERS } from '../data/seed';

export type SortField = 'title' | 'priority' | 'dueDate';
export type SortDir = 'asc' | 'desc';
export type ViewMode = 'kanban' | 'list' | 'timeline';

export interface Filters {
  status: Status[];
  priority: string[];
  assignee: string[];
  dateFrom: string;
  dateTo: string;
}

interface State {
  tasks: Task[];
  view: ViewMode;
  filters: Filters;
  sortField: SortField;
  sortDir: SortDir;
}

type Action =
  | { type: 'MOVE_TASK'; taskId: string; status: Status }
  | { type: 'SET_VIEW'; view: ViewMode }
  | { type: 'SET_FILTER'; filters: Partial<Filters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; field: SortField }
  | { type: 'SET_TASK_STATUS'; taskId: string; status: Status };

const defaultFilters: Filters = {
  status: [], priority: [], assignee: [], dateFrom: '', dateTo: ''
};

const initialState: State = {
  tasks: generateTasks(500),
  view: 'kanban',
  filters: defaultFilters,
  sortField: 'dueDate',
  sortDir: 'asc',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'MOVE_TASK':
    case 'SET_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId ? { ...t, status: action.status } : t
        )
      };
    case 'SET_VIEW':
      return { ...state, view: action.view };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: defaultFilters };
    case 'SET_SORT':
      return {
        ...state,
        sortField: action.field,
        sortDir: state.sortField === action.field && state.sortDir === 'asc' ? 'desc' : 'asc'
      };
    default:
      return state;
  }
}

const TaskContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  filteredTasks: Task[];
  users: typeof USERS;
} | null>(null);

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filters: Partial<Filters> = {};
    if (params.get('status')) filters.status = params.get('status')!.split(',') as Status[];
    if (params.get('priority')) filters.priority = params.get('priority')!.split(',');
    if (params.get('assignee')) filters.assignee = params.get('assignee')!.split(',');
    if (params.get('dateFrom')) filters.dateFrom = params.get('dateFrom')!;
    if (params.get('dateTo')) filters.dateTo = params.get('dateTo')!;
    if (Object.keys(filters).length) dispatch({ type: 'SET_FILTER', filters });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (state.filters.status.length) params.set('status', state.filters.status.join(','));
    if (state.filters.priority.length) params.set('priority', state.filters.priority.join(','));
    if (state.filters.assignee.length) params.set('assignee', state.filters.assignee.join(','));
    if (state.filters.dateFrom) params.set('dateFrom', state.filters.dateFrom);
    if (state.filters.dateTo) params.set('dateTo', state.filters.dateTo);
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [state.filters]);

  const filteredTasks = state.tasks
    .filter(t => {
      if (state.filters.status.length && !state.filters.status.includes(t.status)) return false;
      if (state.filters.priority.length && !state.filters.priority.includes(t.priority)) return false;
      if (state.filters.assignee.length && !state.filters.assignee.includes(t.assigneeId)) return false;
      if (state.filters.dateFrom && t.dueDate < state.filters.dateFrom) return false;
      if (state.filters.dateTo && t.dueDate > state.filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (state.sortField === 'title') cmp = a.title.localeCompare(b.title);
      if (state.sortField === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (state.sortField === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate);
      return state.sortDir === 'asc' ? cmp : -cmp;
    });

  return (
    <TaskContext.Provider value={{ state, dispatch, filteredTasks, users: USERS }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
}