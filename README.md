# 🏗️ Project Architect

Project Architect is a powerful, AI-driven scaffolding tool that transforms your project ideas into production-ready directory structures and starter code instantly. Built with Node.js, Express, and Google Gemini.

## 🚀 Features

- **AI-Powered Scaffolding**: Uses Google Gemini to generate professional folder structures based on natural language descriptions.
- **Stunning UI/UX**: High-fidelity dark mode design with glassmorphism, responsive layouts, and smooth animations.
- **Interactive File Explorer**: Visually browse the generated project with file previews and collapsible folders.
- **Instant ZIP Download**: Download your entire project structure in one click.
- **BYOK (Bring Your Own Key)**: Support for user-provided Gemini API keys stored locally.
- **PWA Ready**: Mobile-friendly, installable, and fast.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), Tailwind CSS (CDN), Material Symbols, JSZip.
- **Backend**: Node.js, Express, @google/generative-ai, express-rate-limit.

## 📦 Local Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_server_side_key_here
PORT=3000
```

### 4. Running the App
Start the backend server:
```bash
npm start
```
The app will be available at `http://localhost:3000`.

## 🌐 Deployment

### Deploying to Vercel
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Add your `GEMINI_API_KEY` to the Vercel environment variables.
4. Deploy!

## 📄 License
MIT License.
