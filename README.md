# User Management Web Application
- This project was developed to practice backend development, authentication, and RESTful API design.
- It was independently designed and implemented through self-research and technical consultation.

### Live Demo
- https://choazeusermanagement.netlify.app

### Notes
- The application is deployed using the production build
- Environment variables such as database connection and API keys are managed securely on the server
- The free tier may cause the server to sleep when inactive

## Tech Stack
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT (JSON Web Token), bcrypt
- Frontend: HTML, CSS, JavaScript
- Tools: dotenv, cors, body-parser

## Features
- User registration (Sign up)
- User login with JWT authentication
- Secure password hashing using bcrypt
- CRUD operations for user data
- Protected routes with JWT middleware
- User profile management (/users/me)
- RESTful API structure

## Prerequisites
- Node.js (v18 or later recommended)
- MySQL (Local instance)
- npm

## Installation
```bash
git clone <your-repository-url>
cd <project-folder>
npm install
```

## Database Setup
```sql
CREATE DATABASE user_management;
USE user_management;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  note TEXT,
  role VARCHAR(50) DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Build and Run (Production)
```bash
npm install build
npm run start
```

## Environment Variables 
This project uses environment variables for configuration. Create a .env file in the backend root directory and add the following:
```env
PORT=3000
JWT_SECRET=your_jwt_secret
```

## Deployment

This project is deployed on **Netlify** for production usage.

- Platform: Netlify
- Backend: Node.js / Express
- Database: MySQL (MAMP)
- Environment variables are configured on Netlify dashboard

## API Endpoints
### Authentication
- POST /auth/login — Login and receive JWT token

### Users
- GET /users — Get all users
- GET /users/:id — Get user by ID
- POST /users — Create a new user
- PUT /users/:id — Update user
- DELETE /users/:id — Delete user

### Protected Routes
- GET /users/me — Get current user profile
- PUT /users/me — Update current user profile
- Protected routes require Authorization: Bearer <JWT_TOKEN> header.
  
## What I Did 
- Independently designed and developed the entire backend system
- Implemented user authentication using JWT and secure password hashing
- Built CRUD operations for user management with MySQL
- Structured Express middleware for protected routes
- Gained hands-on experience in backend architecture and API design

## License
- This project is for educational and portfolio purposes.
