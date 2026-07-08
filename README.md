# 🎯 StreakFlow — Elite Habit Tracker

**Live App:** [streakflow-smoky.vercel.app](https://streakflow-smoky.vercel.app) 

**GitHub:** [streakflow](https://github.com/Saqib216/streakflow)

StreakFlow is a minimalist, high-contrast habit-tracking application built to help you build positive routines and break unproductive cycles — side by side, in one place. It pairs a fluid dark-themed UI with real-time cloud sync, and lets you start tracking instantly as a guest with zero signup friction.

![StreakFlow](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white) ![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

---

## ✨ Features

- **🔄 Dual Habit Tracking**
  - **Good Habits** — build positive routines with progress rings, streak counters, and daily completion logs.
  - **Bad Habits** — break negative cycles with a live relapse timer tracking days, hours, and minutes clean.
- **☁️ Google Sign-In with Firestore Sync** — sign in with one click and your habits sync in real time across every device, protected by Firestore security rules scoped to your own user ID.
- **⚡ True Guest Mode, Not a Demo** — no account needed to start. Guest data lives entirely in your browser's LocalStorage, and the app opens to a clean, empty state on first run — no placeholder habits, no clutter.
- **🔀 One-Click Cloud Migration** — sign in later and StreakFlow detects your local guest habits and offers to import them straight into your account.
- **🛡️ Resilient Error Handling** — if Firestore is unreachable (e.g. blocked by an ad-blocker or privacy extension), StreakFlow surfaces a clear, actionable message instead of failing silently, with a "Use Offline Mode" fallback.
- **📊 Real-Time Dashboard** — an at-a-glance summary bar showing completion rates, active streaks, and best streaks.
- **🎨 Premium Dark Aesthetic** — a deep obsidian-zinc canvas with rose-to-emerald accent gradients, smooth Framer Motion micro-animations, and a custom vector favicon.

---

## 🧠 What's Actually Under the Hood

This started as a Google AI Studio scaffold, then went through real debugging and hardening beyond the generated boilerplate:

- Firestore security rules were rewritten and properly deployed (not just left as permissive defaults) so each user can only read/write their own documents.
- Google Sign-In popups are made compatible with Vercel's default `Cross-Origin-Opener-Policy` headers via a custom `vercel.json`.
- Guest LocalStorage is fully cleared on sign-out, so no stale or sample data ever leaks between sessions or accounts.
- Auth state is resolved before any Firestore read fires, avoiding race-condition permission errors on page reload.

---

## 🛠️ Project Commands

| Command | What it does | When to use it |
|---|---|---|
| `npm run dev` | Starts Vite's local dev server with instant hot-reload | While actively coding, at `http://localhost:3000` |
| `npm run build` | Compiles & minifies the app into static assets in `/dist` | Before deploying to Vercel/Netlify/any static host |
| `npm run lint` | Runs `tsc --noEmit` to type-check the whole codebase | Before committing or pushing, to catch type errors early |

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/Saqib216/streakflow.git
cd streakflow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then, in the [Firebase Console](https://console.firebase.google.com/), publish Firestore rules that scope every document to `request.auth.uid`, and enable **Google** as a sign-in provider under Authentication.

### 4. Run the app
```bash
npm run dev
```

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub.
2. On [Vercel](https://vercel.com/), click **Add New → Project** and import the `streakflow` repo.
3. Add the same `VITE_FIREBASE_*` environment variables under **Project Settings → Environment Variables**.
4. Make sure `vercel.json` is present at the project root with:
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "Cross-Origin-Opener-Policy", "value": "same-origin-allow-popups" }
         ]
       }
     ]
   }
   ```
   This is required for Google Sign-In popups to work correctly on Vercel.
5. Click **Deploy**.

---

## 🩹 Troubleshooting

| Symptom | Likely Cause |
|---|---|
| `Missing or insufficient permissions` in console | Firestore rules weren't published in the Firebase Console, or you're viewing a different Firebase project than the one the app is wired to |
| Sign-in popup closes with a COOP warning | `vercel.json` header isn't deployed — check the Network tab response headers for the live site |
| Old/sample habits reappear after signing out | Clear the `streakflow_good_habits` / `streakflow_bad_habits` keys under DevTools → Application → Local Storage |

---

## 🎨 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion (`motion/react`)
- **Icons:** Lucide React
- **Backend:** Firebase Authentication (Google) & Firebase Firestore
- **Hosting:** Vercel

---

## 🤝 Contributing

Issues and PRs are welcome. If you're proposing a feature, open an issue first so we can discuss direction before you put in the work.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 👨‍💻 Author

**Muhammad Saqib Hussnain** |
- [GitHub](https://github.com/Saqib216)
- [LinkedIn](https://www.linkedin.com/in/saqib-hussnain) 
- [Instagram](https://instagram.com/itx.saqib.hussnain)
- [Portfolio](https://saqib-portfo.netlify.app)

---

## 📄 License

This project currently has no explicit license — all rights reserved by default. If you'd like to reuse this code, please open an issue to ask.