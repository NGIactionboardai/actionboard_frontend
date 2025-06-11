
# 📝 NGI Transcribe App - Frontend

Welcome to the **NGI Transcribe App Frontend**, a Next.js-based web application for transcribing and managing meeting conversations with an intuitive UI.

> This is the frontend of the **Advanced Meeting Intelligence System**, designed to seamlessly interact with the backend API and provide real-time meeting transcription, analysis, and management tools.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: JavaScript (React)
- **State Management**: Redux
- **Styling**: Tailwind CSS
- **Rich Text Editor**: React-Quill
- **Animations**: Framer Motion
- **Form Controls**: React-Select

---

## 📁 Folder Structure (Simplified)

frontend/
├── app/
│ ├── components/ # Reusable UI components (buttons, forms, modals, etc.)
│ ├── pages/ # Next.js App Router pages (structured by route folders)
│ ├── utils/ # Helper functions (formatters, API utils, etc.)
│ ├── layout.tsx # Global layout for App Router
│ └── page.tsx # Entry point of the application (Landing or Dashboard)
├── redux/ # Redux Toolkit slices, store config (global state)
├── data/ # Static data, mock data, constants
├── public/ # Static assets like images, icons, logos
├── styles/ # Global and modular CSS / Tailwind configs
├── .env.local # Local environment variables
├── next.config.js # Next.js configuration
└── package.json # Project metadata and dependencies


---

## 🛠️ Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/ayanchyaziz123/ngi-transcribe-app-frontend.git
cd ngi-transcribe-app-frontend

# Install dependencies
npm install
# or
yarn install


#Running the Development Server
npm run dev
# or
yarn dev


## ✨ Features

### 🤖 AI-Powered Capabilities

- 🔊 **Real-time Meeting Transcription**  
  Retrieve and transcribe live or recorded meetings using AI-powered speech recognition with support for **Zoom**, **Google Meet**, and **Microsoft Teams**.

- 🧠 **Smart Summarization**  
  Automatically generate intelligent summaries of meetings, extracting key points, decisions, and action items.

- 🗣️ **Speaker Identification (Planned)**  
  AI-driven diarization to identify and label individual speakers during meetings.

- 🧠 **Context-Aware Highlights (Planned)**  
  Automatically detect and highlight critical parts of a meeting using semantic analysis.

---

### 🧩 UI & UX Features

- 🗂️ **Multi-Step Form Workflow**  
  Easily manage and edit transcription records through a guided, step-by-step interface.

- 🔍 **Meeting Retrieval from Major Platforms**  
  Connect your Zoom, Google Meet, or MS Teams accounts to securely fetch and sync past meetings for processing.

- 📅 **Pagination, Filtering & Sorting**  
  Navigate and organize your transcriptions with advanced filters by date, speaker, or platform.

- 🔐 **Google Authentication**  
  Log in securely using Google

- 🎨 **Modern UI & Animations**  
  Built with Tailwind CSS and Framer Motion for sleek transitions, responsiveness, and a great user experience.



