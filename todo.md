# Todo Calendar App - Feature Tracking

## Database & Backend
- [x] Create tasks table with name, description, dueDate, dueTime, userId, completed, createdAt, updatedAt
- [x] Create user_feedback table for collecting user experience ratings and comments
- [x] Create database migration and push schema

## Backend API (tRPC Procedures)
- [x] Create task.create procedure (protected)
- [x] Create task.list procedure (protected) - list tasks for a specific date or all tasks
- [x] Create task.update procedure (protected) - mark task as done
- [x] Create task.delete procedure (protected)
- [x] Create feedback.submit procedure (protected) - save user feedback
- [x] Write vitest tests for all procedures

## Frontend - Calendar & Task Management
- [x] Design Scandinavian minimal UI with pale gray background, bold black typography, soft pastel accents
- [x] Create calendar component with month navigation
- [x] Create task creation form with name, description, due date, and time (HH:MM format)
- [x] Create task list view for selected date
- [x] Implement task completion toggle with visual indication (strikethrough/checkmark)
- [x] Implement task deletion with confirmation dialog
- [x] Create responsive layout for desktop and mobile

## Notifications
- [x] Request browser notification permission when creating first task
- [x] Implement notification scheduling system
- [x] Send browser notifications at scheduled task time
- [x] Handle notification permission states (granted, denied, default)

## User Feedback
- [x] Create user feedback form component
- [x] Collect ratings and comments
- [x] Display feedback form at bottom of app

## Testing & Refinement
- [x] Test task creation, update, delete functionality
- [x] Test calendar navigation
- [x] Test notifications on scheduled time
- [x] Test responsive design on mobile and desktop
- [x] Verify no errors or malfunctions
- [x] User experience testing

## Static Webpage
- [ ] Create presentation webpage showcasing the app
- [ ] Include interactive charts and visualizations
- [ ] Add features to explore data, understand trends, and share results

## Deployment
- [ ] Create final checkpoint
- [ ] Publish to Manus
