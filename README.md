# ⚡ ASCEND — AI-Powered Technical Placement & Interview Accelerator

> **Ascend** is a production-grade, AI-driven placement preparation platform that combines real-time AI technical mock interviews, executive ATS resume analysis, dynamic multi-track skill graphs, and placement readiness analytics.

---

## ✨ Key Features

### 📄 1. ATS Resume Studio & High-Impact Bullet Rewriter
- **Mozilla PDF.js Parser**: High-accuracy text stream parsing for Adobe PDF documents.
- **ATS Role Benchmarking**: Evaluates candidates against 8 specialized engineering tracks (*Web Developer, SDE Backend, AI/ML Engineer, Data Scientist, DevOps, Mobile, Security, Full Stack*).
- **Targeted Bullet Rewriter**: Isolates individual project bullets and rewrites them with action verbs and quantifiable metrics (*e.g., latency reductions, request scaling*).

### 🎙️ 2. AI Staff Engineer Mock Interviewer
- **Adaptive 3-Stage Screening**: Architecture Design $\rightarrow$ Technical Deep-Dive Probe $\rightarrow$ Failure Mode Recovery.
- **Voice & Text Input**: Real-time Web Speech Synthesis (TTS audio output) & Web Speech Recognition (voice-to-text input).
- **Empathetic Pivot Questions**: Automatically pivots if candidate encounters unknown concepts without penalty.
- **Official Hiring Scorecard**: Detailed scorecard with hiring verdict (*Strong Hire, Hire, Lean Hire, No Hire*), technical strengths, and gap analysis.

### 🗺️ 3. Dynamic Skill Graph & 4-Day Study Roadmap
- **Interactive D3 Skill Node Graph**: Visualizes topic mastery, prerequisites, and skill relationships.
- **Custom Track Creation**: Supports building custom engineering tracks with tailored skill nodes.
- **Personalized 4-Day Roadmap**: Generates structured daily study plans targeting candidate weak points.

### 📱 4. Mobile & Desktop Optimization
- **Responsive Navigation**: Desktop vertical rail sidebar ($\ge 768\text{px}$) & glassmorphic floating mobile bottom bar ($< 768\text{px}$) with an all-pages sheet drawer.
- **Cloud-First State Synchronization**: Real-time Firebase Cloud Firestore DB sync and persistent username management.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, Server Actions, API Routes)
- **Styling**: Tailwind CSS, Glassmorphism design system
- **AI Engine**: Google Gemini AI (Gemini 2.0 Flash)
- **PDF Parser**: Mozilla `pdfjs-dist` CDN Parser
- **Database & Auth**: Firebase Cloud Firestore & Firebase Authentication
- **Icons**: Lucide React

---

## 🚀 Quick Start & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/LuckyJadhav2808/Ascend-InnovaHack.git
cd Ascend-InnovaHack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAFDhEYWiQzFUZTFOsofGsyH0_Y73KrrEc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ascend-my-version.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ascend-my-version
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ascend-my-version.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=681182232267
NEXT_PUBLIC_FIREBASE_APP_ID=1:681182232267:web:5de4f253397258502da54e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-8QZR2XXQH9

# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

This project is created for the InnovaHack Hackathon. All rights reserved.
