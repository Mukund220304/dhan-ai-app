# Dhan AI - Expense Tracker

A modern, production-grade AI-powered Expense Tracker Web Application.

## Project Structure
- `/backend`: Node.js Express API with MongoDB, JWT Authentication, File Parsers, and OpenAI integration.
- `/frontend`: React.js (Vite) application styled with Tailwind CSS.

## Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- OpenAI API Key
- Google OAuth Client ID

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. The `.env` file has been created. Ensure you add your real API keys in `backend/.env`:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/dhanai
   JWT_SECRET=your_secure_jwt_secret
   OPENAI_API_KEY=sk-...
   GOOGLE_CLIENT_ID=...
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Update `frontend/src/main.jsx` with your actual Google Client ID if you want OAuth to work.
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Next Steps for Production Integration (Step 9)
- **API Connecting**: Connect the React frontend forms to the backend Axios service layer.
- **State Management**: Implement React Context or Zustand to manage user sessions across the app.
- **Vector Database**: For large scale AI integration, replace the `limit(100)` fetch in `chatController.js` with Pinecone or MongoDB Vector Search for embedding retrieval.
