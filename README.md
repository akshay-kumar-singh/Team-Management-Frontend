# Workzen - Team Collaboration Platform

A real-time team collaboration platform with Assistant-powered task management, Kanban boards, and team chat.

---

## Features

- **Authentication:** Firebase Auth with role-based access (Admin/Manager/Member)
- **Project Management:** Create, edit, delete projects with role permissions
- **Task Management:** Kanban board with drag-and-drop functionality
- **Assistant:** Natural language task management (create, move, assign tasks)
- **Real-Time Chat:** Socket.IO powered team messaging
- **Team Overview:** View all team members with roles
- **Responsive Design:** Works on mobile, tablet, and desktop

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, Firebase Admin, Socket.IO, Joi  
**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client, @hello-pangea/dnd, React Hot Toast

---

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/kriscent.git
cd frontend
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## Running the Application

### Start Backend
```bash
cd backend
npm start
```
Backend runs on: `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## How to Test All Features

### 1. Registration & Login
- Go to `http://localhost:3000`
- Click "Create Account"
- Fill: Name, Email, Password, Role (Admin/Manager/Member)
- Click "Create Account"
- **Verify:** Redirected to dashboard, header shows your name and role

### 2. Project Management

**Create Project (Admin/Manager):**
- Go to "Projects" page
- Click "+ New Project"
- Enter name and description
- Click "Create Project"
- **Verify:** Project card appears

**Edit Project:**
- Click edit icon on project card
- Modify details, click "Update Project"
- **Verify:** Changes saved

**Delete Project (Admin only):**
- Click delete icon, confirm
- **Verify:** Project removed

### 3. Task Management

**Create Task:**
- Click "Tasks" in sidebar or click a project card
- Click "+ New Task"
- Enter title, description, status, assign to member
- Click "Create Task"
- **Verify:** Task appears in correct column

**Drag & Drop:**
- Click and hold a task card
- Drag to another column (To Do → In Progress → Done)
- Release
- **Verify:** Task moves, toast notification appears

**Edit/Delete Task:**
- Click edit/delete icons on task card
- **Verify:** Changes applied

### 4. Assistant

In the Assistant panel (right side of Tasks page), try these commands:

```
create task Build login page
```
**Verify:** Task created in "To Do" column

```
move Build login page to in progress
```
**Verify:** Task moves to "In Progress" column

```
move Build login page to done
```
**Verify:** Task moves to "Done" column

### 5. Real-Time Chat

**Test Real-Time:**
- Open two browser windows
- Login as different users in each
- Go to "Chat" page in both
- Send message from Window 1
- **Verify:** Message appears instantly in Window 2

**Message Features:**
- Your messages show on right (purple bubble)
- Others' messages show on left (white bubble)
- Sender name and timestamp displayed
- Auto-scrolls to latest message

### 6. Team Overview
- Click "Team" in sidebar
- **Verify:** All team members listed with roles, emails, status

### 7. Dashboard
- Click "Dashboard" in sidebar
- **Verify:** Statistics show correct counts (projects, tasks, members)

### 8. Role-Based Permissions

**Test as Admin:**
- ✅ Can create/edit/delete projects
- ✅ Can manage tasks

**Test as Manager:**
- ✅ Can create/edit projects
- ❌ Cannot delete projects

**Test as Member:**
- ❌ Cannot create/edit/delete projects
- ✅ Can manage tasks

**How to test:**
- Register users with different roles
- Login as each user
- Check which buttons/features are visible


---

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users/me` - Get current user
- `GET /api/users/team` - Get team members

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Admin/Manager)
- `PUT /api/projects/:id` - Update project (Admin/Manager)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Tasks
- `GET /api/tasks?projectId=xxx` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Messages
- `GET /api/messages?teamId=xxx` - Get messages
- `POST /api/messages` - Send message

**All endpoints require:** `Authorization: Bearer <firebase-token>`

---

## Project Structure

```
Workzen/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── firebase.js           # Firebase Admin setup
│   ├── controllers/
│   │   ├── messageController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js               
│   │   └── roleCheck.js          # Role-based access
│   ├── models/
│   │   ├── Message.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Team.js
│   │   └── User.js
│   ├── routes/
│   │   ├── messages.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── validators/
│   │   └── schemas.js            # Joi validation schemas
│   ├── .env
│   ├── server.js                 # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── assistant/
│   │   │   │   └── TaskAssistant.jsx    #  Assistant
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   └── MessageList.jsx
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── Modal.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   ├── ProjectList.jsx
│   │   │   │   └── ProjectModal.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── Column.jsx
│   │   │   │   ├── KanbanBoard.jsx
│   │   │   │   ├── TaskCard.jsx
│   │   │   │   └── TaskModal.jsx
│   │   │   └── team/
│   │   │       ├── MemberCard.jsx
│   │   │       └── TeamOverview.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useChat.js
│   │   │   ├── useProjects.js
│   │   │   ├── useSocket.js
│   │   │   └── useTasks.js
│   │   ├── pages/
│   │   │   ├── Chat.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Tasks.jsx
│   │   │   └── Team.jsx
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance
│   │   │   ├── assistant.js        # Assistant command parser
│   │   │   ├── firebase.js         # Firebase config
│   │   │   └── socket.js           # Socket.IO setup
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## Database Schema

### User
```javascript
{
  firebaseUid: String (unique),
  email: String (unique, required),
  name: String (required),
  role: Enum ["ADMIN", "MANAGER", "MEMBER"],
  teamId: ObjectId (ref: Team)
}
```

### Team
```javascript
{
  name: String (required),
  description: String,
  adminId: ObjectId (ref: User)
}
```

### Project
```javascript
{
  name: String (required),
  description: String,
  teamId: ObjectId (ref: Team, required)
}
```

### Task
```javascript
{
  title: String (required),
  description: String,
  status: Enum ["todo", "in-progress", "done"],
  projectId: ObjectId (ref: Project, required),
  assignedTo: ObjectId (ref: User)
}
```

### Message
```javascript
{
  content: String (required),
  senderId: ObjectId (ref: User, required),
  teamId: ObjectId (ref: Team, required),
  timestamp: Date (default: now)
}
```

---

## Deployment

### Backend (Render/Railway)
1. Create account on Render.com or Railway.app
2. Create new Web Service
3. Connect GitHub repository
4. Set environment variables from `.env`
5. Deploy

### Frontend (Vercel/Netlify)
1. Create account on Vercel.com or Netlify.com
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy

### Update Frontend .env
```env
VITE_API_URL=https://your-backend-url.com
```

---

## Troubleshooting

**Backend won't start:**
- Check MongoDB URI is correct
- Verify Firebase credentials
- Ensure port 5000 is not in use

**Frontend won't connect:**
- Check VITE_API_URL points to backend
- Verify Firebase config is correct
- Clear browser cache

**Socket.IO not working:**
- Check both servers are running
- Verify CORS settings in backend
- Check browser console for connection errors

**Authentication fails:**
- Verify Firebase project settings
- Check Firebase Auth is enabled in console
- Ensure private key has proper line breaks (\n)

---

## Quick Test Checklist

- [ ] User can register and login
- [ ] Dashboard shows statistics
- [ ] Admin can create/edit/delete projects
- [ ] Manager can create/edit projects (not delete)
- [ ] Member cannot manage projects
- [ ] Tasks can be created and assigned
- [ ] Drag-and-drop works (task moves columns)
- [ ] AI assistant creates tasks
- [ ] AI assistant moves tasks
- [ ] Real-time chat sends/receives messages
- [ ] Team page shows all members
- [ ] Mobile responsive design works
- [ ] All toast notifications appear

---

## Author

**Akshay Kumar Singh**  
GitHub: https://github.com/akshay-kumar-singh  
Email: akshaysing975@gmail.com

---
