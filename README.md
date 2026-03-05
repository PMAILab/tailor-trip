<div align="center">
<img width="1200" height="475" alt="TailorTrip Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🌏 TailorTrip
### *Don’t just book. Optimize.*
</div>

---

## 🚀 Overview
**TailorTrip** is an AI-powered **Smart Travel Optimizer** designed for Gen Z and Millennials in Indian metro cities. It acts as a decision engine that fills the gap between travel inspiration and booking. Unlike traditional OTAs that overwhelm users with countless listings, TailorTrip provides personalized, data-backed clarity on **where, when, and why** to travel.

### ✨ Key Value Proposition
- **It is NOT:** A full OTA, a hotel marketplace, or a generic itinerary builder.
- **It IS:** A decision engine, an optimization layer, and a personalized travel clarity tool.

---

## 🎯 The Problem
Young metro travelers suffer from **discovery fatigue** and **indecision**. They often fear overpaying or booking at the wrong time (weather/crowds). TailorTrip reduces this mental load by presenting clear trade-offs and intelligent timing guidance.

---

## 🛠️ MVP Features
### 1. 🌈 Mood-Based Discovery
Start your journey with a vibe, not a date. Select from moods like *“Need a reset”*, *“Adventure mode”*, or *“Workation vibe”* to see curated recommendations.

### 2. 🎴 Smart Destination Cards
At-a-glance insights for every destination:
- **Estimated Total Cost:** Transparency upfront.
- **Timing Badges:** Cheapest Month, Crowd Indicator, and Weather Pattern.
- **"Why this fits you":** AI-generated explanations justifying the recommendation.

### 3. 📊 Optimization Dashboard
Deep dive into your trip before you commit:
- **Cost Breakdown:** Travel, stay, and food estimates.
- **Timing Insights:** Charts for cost trends and crowd calendars.
- **Trade-Off Toggle:** Switch between *Cheapest*, *Least Crowded*, and *Balanced* views.
- **Budget Fit Meter:** Optional salary-based affordability check.

### 4. 📌 Save & Shortlist
Keep track of your favorite optimized trips to compare later.

---

## 💻 Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS 4, Motion (Framer Motion)
- **Backend:** Express, Node.js
- **Database:** SQLite (Better-SQLite3)
- **AI Integration:** Google Gemini (@google/genai)
- **State Management/Routing:** React Router 7

---

## ⚙️ Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [NPM](https://www.npmjs.com/)

### ⚓ Git Configuration (Terminal)
Before you start contributing, ensure your Git identity and credential helper are configured to avoid repeated login prompts.

**1. Set your identity (Both Mac & Windows):**
```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```

**2. Configure Credential Helper:**
- **On Mac:**
  ```bash
  git config --global credential.helper osxkeychain
  ```
- **On Windows:**
  ```bash
  git config --global credential.helper manager
  ```

### Installation Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/aayush2095/tailor-trip.git
   cd TailorTrip
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your **Gemini API Key**:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 🛠️ Project Setup & Developer Log
To ensure a smooth transition from concept to code, the following s67E2-402Cteps were taken during the initial setup:

### 1. Environment & Dependency Alignment
- Initialized the project with a robust stack including **React 19** and **Vite**.
- Installed core dependencies: `npm install`
- Configured local environment variables for AI integration:
  ```bash
  cp .env.example .env
  ```

### 2. Documentation-First Approach
Created a dedicated `docs/` directory to house architectural and product decisions:
- `docs/prd/`: Contains the original MVP product requirements.
- `docs/prompts/`: Stores high-clarity AI prompts (e.g., UI generation master prompts) to maintain design consistency.
- `docs/screenshots/`: Reserved for capturing visual milestones.

### 3. Git Workflow & Repository Hosting
- Sanitized the project by ensuring sensitive data is ignored via `.gitignore`.
- Initialized Local Git Repository: `git init`
- Connected to GitHub: 
  ```bash
  git remote add origin https://github.com/aayush2095/tailor-trip
  git push -u origin main
  ```

---

## 🗺️ Roadmap (Post-MVP)
- **Phase 2:** Side-by-side comparison dashboard, behavioral personalization, and seasonal alerts.
- **Phase 3:** Collaborative trip planning rooms, expense splitting, and AI-powered itinerary builders.

---

<div align="center">
  <sub>Built with ❤️ for the next generation of travelers.</sub>
</div>
