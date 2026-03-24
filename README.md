# Velozity Tracker

A multi-view project management tool built with React + TypeScript.

## Live Demo
[velozity-tracker-neon.vercel.app](https://velozity-tracker-neon.vercel.app)

## Setup
```bash
npm install
npm start
```

## State Management
Used **React Context + useReducer** because the state is shared globally across views (filters, tasks, sort), useReducer handles complex state transitions cleanly without extra dependencies, and the app doesn't need the overhead of an external library.

## Virtual Scrolling
Implemented from scratch in ListView. The approach:
- Container has fixed height (500px) with overflow-y scroll
- Total height spacer div = totalRows × ROW_HEIGHT (48px) keeps scrollbar accurate
- On scroll event, calculate startIndex = scrollTop / ROW_HEIGHT minus 5 buffer rows
- Only render visible rows positioned absolutely at startIndex × ROW_HEIGHT
- This means 500 tasks = only ~15 DOM nodes at any time

## Drag and Drop
Built using native HTML5 drag events (no libraries):
- onDragStart stores the dragged task in a useRef
- onDragOver on columns sets visual highlight state
- onDrop dispatches MOVE_TASK to update status in context
- onDragEnd clears all drag state and snaps back if dropped outside
- Placeholder effect achieved via opacity reduction on dragged card

## Features
- Kanban, List, Timeline views with instant switching
- Custom drag and drop between Kanban columns
- Virtual scrolling (500+ tasks, only visible rows rendered)
- URL-synced filters (shareable, bookmarkable)
- Live collaboration indicators (simulated)
- Overdue task highlighting
- Inline status change in List view

## Hardest Problem
The virtual scrolling required careful coordination between the scroll container height, absolute positioning of rendered rows, and buffer management to prevent blank gaps during fast scrolling.
