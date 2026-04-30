# TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking progress with role-based access control (Admin/Member).

## Live Demo
https://taskflow-wfrl.onrender.com/auth/login

##  Features
- Signup/Login with secure bcrypt password hashing
- Role-based access control (Admin vs Member)
- Admins can create projects and add members by email
- Task creation with assignment, due dates, and status tracking
- Auto-detection of overdue tasks
- Dashboard with stats (Total, In Progress, Completed, Overdue)
- AJAX status updates without page reload

##  Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Frontend:** EJS, Bootstrap 5
- **Auth:** express-session, bcryptjs
- **Deployment:** Railway

##  Local Setup
1. Clone the repo
2. Run `npm install`
3. Create `.env` file: MONGO_URL=your_mongodb_url
                       SESSION_SECRET=your_secret
                       PORT=8080
4. Run `node app.js`
5. Visit `http://localhost:8080`

## 👤 Roles
| Action | Admin | Member |
|--------|-------|--------|
| Create Project | ✅ | ❌ |
| Add Members | ✅ | ❌ |
| Create Tasks | ✅ | ❌ |
| Update Task Status | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |
