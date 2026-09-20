# Customer Support Chatbot

An LLM-powered customer support chatbot designed to answer
product-related questions and redirect unrelated queries
to appropriate customer support channels.

## Team

| Member | Role / Responsibility |
|---|---|
| Prashant Jaiswal | Team Leader, Presenter, Database / Product Knowledge |
| Aditya Yadav | LLM / Chatbot Logic |
| Yash Pratap Pal | Frontend / UI |
| Kushagra Kumar Anant | Backend / API |
# 🤖 Customer Support Chatbot

A full-stack **AI-powered Customer Support Chatbot** built using **React, Node.js, Express, MongoDB, and Google Gemini AI**. The chatbot provides instant answers for product-related queries, FAQs, and falls back to Gemini AI for general conversations.

---
## 🌐 Live Demo

Frontend: https://ad-cell-ai.github.io/CUSTOMER-SUPPORT-CHATBOT/

Backend: https://customer-support-chatbot-gf37.onrender.com

> **Note:** The backend must be deployed separately (Render/Railway/Vercel) for the AI chatbot to work online.

---

## ✨ Features

- 💬 AI-powered customer support chatbot
- 📦 Product search with price and stock information
- ❓ FAQ support
- 🤖 Gemini AI fallback for unrelated questions
- 🗄️ MongoDB database integration
- 🔒 Environment variable support
- 🌍 CORS enabled for frontend deployment
- 📱 Responsive user interface

---
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Google Gemini API

---

## 📂 Project Structure

```
CUSTOMER-SUPPORT-CHATBOT/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── chatbot/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/ad-cell-ai/CUSTOMER-SUPPORT-CHATBOT.git
```

Move into the project directory:

```bash
cd CUSTOMER-SUPPORT-CHATBOT
```

---

## Backend Setup

Go to backend folder

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_gemini_api_key

FRONTEND_URL=http://localhost:5173

NODE_ENV=development
```

Start backend

```bash
npm run dev
```

---

## Frontend Setup

Go to frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run frontend

```bash
npm run dev
```

---

## 🚀 Build for Production

```bash
npm run build
```

---

## 🌐 Deployment

### Frontend

Deploy using **GitHub Pages**

```bash
npm run deploy
```

### Backend

You can deploy the backend on:

- Render
- Railway
- Vercel
- Cyclic

Remember to add all environment variables in your hosting platform.

---

## 📸 Screenshots



---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Backend Port |
| MONGODB_URI | MongoDB Connection String |
| GEMINI_API_KEY | Google Gemini API Key |
| FRONTEND_URL | Frontend URL |
| NODE_ENV | Environment |

---

## 📌 API Endpoint

### Chat API

```
POST /api/chat
```

Request

```json
{
  "message": "What is the price of iPhone 16?"
}
```

Response

```json
{
  "success": true,
  "response": "The price of iPhone 16 is ₹79999."
}
```

---

## 📖 Future Improvements

- User Authentication
- Chat History
- Admin Dashboard
- Product Management
- Voice Support
- Multi-language Support
- Typing Animation
- Better AI Context Memory

---

## 👨‍💻 Author

**Aditya Yadav**

GitHub: https://github.com/ad-cell-ai

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---

## 📄 License

This project is licensed under the MIT License.