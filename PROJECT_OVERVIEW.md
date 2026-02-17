# Time Management Web Application - Project Overview

## Project Description
A modern web-based time tracking application built with Vue 3, TypeScript, and Firebase. The application allows users to track time spent on different projects, manage project details, and view comprehensive time entry records.

## Tech Stack
- **Frontend Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Auth
- **Styling**: SCSS
- **Build Tool**: Vite
- **Icons**: Lucide Vue Next

## Core Features

### 1. Authentication & User Preferences
- User login/logout functionality
- Firebase Authentication integration
- Protected routes with authentication guards
- **Theme Toggle**: Dark/light mode switching
- Theme preference saved in localStorage

### 2. Projects Management
- **Create Projects**: Add new projects with customizable properties
  - Project name and description
  - Color coding for visual identification
  - Hourly rate and currency settings
- **Edit Projects**: Update existing project details
- **Archive Projects**: Archive/unarchive projects
- **Project Statistics**: 
  - Total duration tracking
  - Last entry date tracking
  - Automatic updates when time entries are added/modified

### 3. Time Entries Management
- **Create Time Entries**: Manually add time entries
  - Select project
  - Set start date/time and end date/time
  - Automatic duration calculation
- **Edit Time Entries**: Modify existing entries with intelligent project synchronization
  - Scenario 1: No changes detection (no DB updates)
  - Scenario 2: Same project updates (duration recalculation)
  - Scenario 3: Project change (updates both old and new projects)
- **View Time Entries**: Paginated list with enriched project data
  - Project name and color
  - Calculated cost based on hourly rate
  - Duration display
  - Infinite scroll pagination (10 entries per page)

### 4. Dashboard
- Recent projects display with quick timer start
- Project statistics overview
- Active timer display across pages

### 5. Real-Time Timer
- **Start Timer**: Start tracking time from recent projects
- **Active Timer Display**: Timer visible across all pages
- **Stop Timer**: Stop and save entry automatically
- Timer state persistence

## Key Technical Implementations

### Data Synchronization
- **Bidirectional Updates**: Time entries and projects are kept in sync
  - Creating/updating entries automatically updates project `totalDuration`
  - Intelligent `lastEntryDate` tracking with actual last entry queries
  - Handles project changes with proper cleanup of old project data

### Pagination System
- Custom `usePagination` composable
- Firestore cursor-based pagination
- Infinite scroll component with intersection observer
- Automatic loading of next pages when sentinel is visible

### Data Enrichment
- Time entries enriched with project data for display
  - Project name and color
  - Calculated cost (duration × hourly rate)
  - Currency information
- Prevents redundant database queries by enriching data at fetch time

### Form Validation
- Required field validation
- Error state management
- Real-time validation feedback

### Code Organization
- **Composables**: Reusable logic (pagination, etc.)
- **Components**: Modular UI components
- **Views**: Page-level components
- **Types**: Comprehensive TypeScript interfaces
- **Utils**: Helper functions (time formatting, etc.)

## Database Structure

### Collections
1. **users/{userId}/projects**
   - Project metadata
   - Total duration tracking
   - Last entry date
   - Archive status

2. **users/{userId}/timeEntries**
   - Time entry records
   - Project references
   - Duration calculations
   - Entry type (MANUAL/AUTO)

## Key Components

### Modals
- `EditProjectModal.vue` - Create/edit projects
- `EditTimeEntryModal.vue` - Create/edit time entries
- `ArchiveProjectModal.vue` - Confirm project archiving

### Pages
- `PageProjects.vue` - Projects list with tabs (Active/Archive)
- `PageEntries.vue` - Time entries list with infinite scroll
- `DashboardView.vue` - Main dashboard
- `ProfileView.vue` - User profile
- `LoginView.vue` - Authentication

### Reusable Components
- `InfiniteScroll.vue` - Infinite scroll container
- `BaseForm.vue` - Dynamic form generator
- `BaseTabs.vue` - Tab navigation
- `ProjectItem.vue` - Project list item
- `EntryItem.vue` - Time entry list item
- `RecentProjectItem.vue` - Dashboard project card

## Helper Functions

### Time Utilities (`lib/time.ts`)
- `formatDate()` - Date formatting
- `formatElapsedTime()` - Duration formatting (HH:MM:SS)
- Time calculations and conversions

### Event System
- Global event emitter for cross-component communication
- Events: PROJECT_CREATED, PROJECT_UPDATED, PROJECT_DELETED, etc.

## Current Status
✅ **Completed Features**:
- User authentication
- Project CRUD operations
- Time entry CRUD operations
- Project-entry synchronization
- Pagination and infinite scroll
- Data enrichment
- Archive functionality
- Dashboard with recent projects
- Real-time timer (start from recent projects, stop and save)
- Dark/light theme toggle with localStorage persistence
- Active timer display across pages

🚧 **In Progress / Pending**:
- Unified timer start button (select any project from dashboard)
- Browser theme preference detection and sync

## Future Enhancements (Potential)
- Reports and analytics
- Export functionality (CSV, PDF)
- Multi-user collaboration
- Mobile responsive improvements
- Filtering and search capabilities for entries
- Time entry categories/tags
- Budget tracking per project
- Notifications and reminders

## Development Notes
- All database operations include proper error handling
- Optimistic UI updates with event-driven architecture
- Type-safe throughout with TypeScript
- Modular and maintainable code structure
- Follows Vue 3 Composition API best practices

---
**Last Updated**: February 18, 2026
