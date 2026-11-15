# 🚨 Campus Emergency Alert System

[![Firebase Hosting](https://img.shields.io/badge/Hosting-Firebase-orange?style=flat-square&logo=firebase)](https://gen-lang-client-0059960435.web.app)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A full-stack, real-time emergency broadcast and campus safety management platform designed to bridge the communication gap between students and campus security administrators. Built with modern web technologies, the application enables rapid emergency reporting, live incident lifecycle tracking, AI-assisted enhancements, and automated multi-channel email dispatching during critical campus situations.

---

## 📖 Table of Contents
- [Overview & Problem Statement](#-overview--problem-statement)
- [Core Features & Workflows](#-core-features--workflows)
- [Complete Technology Stack & Tools](#-complete-technology-stack--tools)
- [Project Architecture](#-project-architecture)
- [Getting Started Locally](#-getting-started-locally)
- [Environment Configuration](#-environment-configuration)
- [Production Build & Deployment](#-production-build--deployment)
- [Security & Access Control](#-security--access-control)

---

## 🎯 Overview & Problem Statement
During campus emergencies (medical crises, security threats, fire hazards, or critical facility failures), delays in communication can escalate risks. The **Campus Emergency Alert System** solves this by providing a centralized, instant-response web portal where:
1. **Students** can broadcast verified emergency reports in seconds.
2. **Administrators** receive immediate real-time dashboard updates and automated email alerts to coordinate rapid response teams.

---

## 🌟 Core Features & Workflows

### 🎓 Student Portal
* **One-Tap Emergency Reporting:** Quickly submit structured emergency alerts categorized by urgency and type (Medical, Security, Fire, Maintenance).
* **Real-Time Status Tracking:** Live synchronization allows students to monitor their submitted report as campus security responds.
* **Fluid & Accessible UI:** Designed with responsive layouts and smooth micro-interactions for stress-free usability on mobile and desktop devices.

### 🛡️ Administrator Command Dashboard
* **Structured Incident Lifecycle Management:** Track and update emergencies through a clear, auditable status pipeline:
  $$\text{New} \longrightarrow \text{Acknowledged (Ack)} \longrightarrow \text{Resolved}$$
* **Priority Filtering & Live Feed:** Automatically sorts incoming alerts by severity and real-time timestamps via Firestore listeners.
* **Automated Multi-Channel Email Dispatch:** Dual-configured email notification pipeline routing critical alerts directly to **`naofumiiwatanisan911@gmail.com`**.

---

## 🛠️ Complete Technology Stack & Tools

Every tool, framework, and library utilized in this project is documented below based on the production configuration:

### 1. Frontend & Core Languages
* **React 19 (`react`, `react-dom`):** Component-based UI architecture utilizing modern React hooks and Context API (`AuthContext`) for global state management.
* **TypeScript (`typescript`):** Strongly-typed JavaScript superset ensuring type safety, cleaner code, and fewer runtime errors across components and Firebase services.
* **HTML5 & CSS3:** Semantic markup paired with modern CSS utility workflows.

### 2. Styling, Icons & Animations
* **Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`, `autoprefixer`):** Utility-first CSS framework compiled natively via Vite for rapid, responsive, and consistent UI styling.
* **Motion (`motion`):** Production-grade animation library powering smooth transitions, modal entrances, and interactive UI feedback.
* **Lucide React (`lucide-react`):** Clean, consistent vector icon set used for emergency indicators, status badges, and navigation controls.

### 3. Build Tools & Runtime Environment
* **Vite 8 (`vite`, `@vitejs/plugin-react`):** Next-generation frontend build tool providing lightning-fast Hot Module Replacement (HMR) during development and optimized Rollup/Rolldown production bundling.
* **Node.js & Express (`express`, `tsx`, `esbuild`):** JavaScript runtime and server utilities supporting local execution and build pipelines.
* **Dotenv (`dotenv`):** Environment variable management for securely loading API keys and configuration parameters.

### 4. Backend, Database & Cloud Infrastructure
* **Firebase 13 (`firebase`):**
  * **Cloud Firestore:** Real-time NoSQL cloud database enabling instant synchronization of emergency alerts between student and admin dashboards without page reloads.
  * **Firebase Authentication:** Secure user authentication and session management.
  * **Firebase Hosting:** Fast, SSL-secured global CDN hosting (Project ID: `gen-lang-client-0059960435`).
* **Firestore Security Rules (`firestore.rules`):** Server-side database rules enforcing Role-Based Access Control (RBAC).

### 5. Third-Party APIs & Notification Integrations
* **EmailJS Browser SDK (`@emailjs/browser`):** Client-side email dispatch integration for sending formatted alert payloads directly from the application.
* **FormSubmit Relay:** Webhook/form email forwarding configured to deliver emergency notifications to `naofumiiwatanisan911@gmail.com`.
* **Google Gen AI SDK (`@google/genai`):** Integrated Google Generative AI capabilities for intelligent text/incident processing.

---

## 📂 Project Architecture

```text
campus-emergency-alert-system-working/
├── dist/                          # Compiled production-ready static assets
├── public/                        # Public static files, favicons, and manifests
├── src/
│   ├── components/                # Modular, reusable UI components (Modals, Alert Cards, Navbars)
│   ├── context/                   # Global React Context providers (AuthContext.tsx)
│   ├── firebase/                  # Firebase app initialization, Auth, and Firestore helpers
│   ├── pages/                     # Role-based views (Student Portal & Admin Dashboard)
│   ├── App.tsx                    # Main application shell and route orchestration
│   └── main.tsx                   # React DOM entry point
├── .env.example                   # Template for required environment variables
├── .firebaserc                    # Firebase project alias configuration
├── .gitignore                     # Git exclusion rules (protects .env and node_modules)
├── firebase.json                  # Firebase Hosting rewrites and deployment settings
├── firebase-applet-config.json    # Firebase client configuration mapping
├── firestore.rules                # Database read/write security permissions
├── index.html                     # Root HTML template
├── package.json                   # Project dependencies, scripts, and metadata
├── tsconfig.json                  # TypeScript compiler configuration
└── vite.config.ts                 # Vite bundler and Tailwind plugin configuration
```

---

## ⚙️ Getting Started Locally

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (comes bundled with Node.js)
* **Git**

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/campus-emergency-alert-system.git
   cd campus-emergency-alert-system
   ```

2. **Install all project dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in your credentials (see [Environment Configuration](#-environment-configuration)).

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   The app will start on `http://localhost:3000`.

---

## 🔐 Environment Configuration

Create a `.env` file in the root directory of the project and configure your keys:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0059960435.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0059960435
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0059960435.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1019243720383
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

## 🚢 Production Build & Deployment

1. **Type-check the codebase:**
   ```bash
   npm run lint
   ```

2. **Generate the optimized production bundle (`dist/`):**
   ```bash
   npm run build
   ```

3. **Deploy to Firebase Hosting:**
   ```bash
   npx firebase-tools deploy --only hosting --project gen-lang-client-0059960435
   ```

---

## 🔒 Security & Access Control
* **Role-Based Access Control (RBAC):** Ensures only authorized administrator accounts can acknowledge or resolve active campus alerts, while students can only create and view permitted records.
* **Version Control Hygiene:** Sensitive `.env` files, build caches (`.firebase`), and `node_modules` are strictly excluded from Git via `.gitignore`.

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).