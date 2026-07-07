# 🎯 StreakFlow – Elite Habit Tracker

StreakFlow is a minimalist, high-contrast habit-tracking application designed to help individuals build positive routines and break unproductive cycles simultaneously. Built with a gorgeous, dark-themed visual design, StreakFlow combines fluid interactive animations with durable cloud persistence and frictionless guest-to-account data migration.

---

## ✨ Features

- **🔄 Dual Habit Loops**:
  - **Good Habits**: Focus on building positive routines with progress rings, milestone tracking, and daily completion logs.
  - **Bad Habits**: Focus on quitting negative cycles with highly sensitive relapse timers tracking elapsed days, hours, and minutes since last contact.
- **☁️ Firebase Authentication & Multi-Device Sync**: Sign in securely with Google to automatically synchronize your streaks across multiple devices.
- **⚡ Frictionless Local-to-Cloud Migration**: Start tracking immediately as a guest. The moment you sign in, StreakFlow intelligently prompts you to merge your local guest habits directly into your newly authenticated account—saving your hard work.
- **📊 Real-Time Performance Dashboard**: Beautiful interactive summaries including overall completion rates, daily targets, and current/best streak counts.
- **🎨 Premium Dark Aesthetic**: Styled with a deep obsidian-zinc canvas, high-contrast rose-to-emerald gradient accents, custom SVG micro-animations, and a matching custom-crafted vector browser favicon.

---

## 🛠️ Project Commands Explained

To work with this project locally or prepare it for production, you will use three primary scripts defined in `package.json`. Here is exactly what they do:

### 1. `npm run dev` (Local Development)
* **What it does**: Starts Vite's ultra-fast local development server.
* **When to use it**: During active coding or when previewing your app locally.
* **Why Vite**: Vite serves your React source files directly as Native ES Modules, making hot reloads almost instantaneous as you edit code.
* **How to view**: Access it via `http://localhost:3000` (or the port assigned by your environment).

### 2. `npm run build` (Production Preparation)
* **What it does**: Compiles, tree-shakes, and minifies your TypeScript and React code into optimized, static browser assets (`index.html`, `js`, `css`, assets) inside the `/dist` folder.
* **When to use it**: Before deploying to hosting providers like **Vercel**, **Netlify**, or **Cloud Run**.
* **Why it's necessary**: Browsers cannot run Raw TypeScript (.ts/.tsx) directly. The build process compiles and optimizes everything so it loads instantly for your visitors.

### 3. `npm run lint` (Code Quality & Type Validation)
* **What it does**: Runs TypeScript's compiler in non-emit mode (`tsc --noEmit`).
* **When to use it**: Before committing your code, pushing to GitHub, or deploying.
* **Why it's necessary**: It scans your entire codebase to catch TypeScript errors, type mismatches, missing imports, or incorrect declarations. If your linter passes green, you can be 100% confident your code compiles flawlessly!

---

## 🚀 Getting Started Locally

Follow these steps to run StreakFlow on your local machine:

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd streakflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase Environment Variables
Create a `.env` file in the root directory and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Launch the App
```bash
npm run dev
```

---

## 🌐 Deploying to Vercel

StreakFlow is fully compatible with one-click deployment on **Vercel**:

1. Push your code to your **GitHub** account.
2. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your `streakflow` repository.
4. Under **Environment Variables**, paste the `VITE_FIREBASE_*` keys you configured in step 3.
5. Click **Deploy**. Vercel will automatically run `npm run build` and publish your app online!

---

## 🎨 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (`motion/react`)
- **Icons**: Lucide React
- **Backend & Database**: Firebase Firestore & Firebase Google Auth
