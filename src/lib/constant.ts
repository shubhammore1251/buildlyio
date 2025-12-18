export const SANBOX_TIMEOUT = 60_000 * 10 * 3; // 30MINS in MS


export const PROJECT_TEMPLATES = [
  {
    emoji: "🎬",
    title: "Build a Netflix clone",
    prompt:
      "Create a Netflix-style homepage with a hero section and movie cards using mock data. Clicking a movie should open a simple detail view showing title and description. Use dark mode and local state.",
  },
  {
    emoji: "📦",
    title: "Basic admin dashboard",
    prompt:
      "Create a lightweight admin dashboard with a sidebar, 3–4 stat cards, and a simple table using mock data and local state. No charts or complex logic. Clean and professional UI.",
  },
  {
    emoji: "📋",
    title: "Minimal kanban board",
    prompt:
      "Build a minimal kanban board with 3 columns and basic drag-and-drop using local state. Support adding and deleting tasks only. Keep styling simple and consistent.",
  },
  {
    emoji: "🛍️",
    title: "Simple product listing",
    prompt:
      "Build a simple product listing page with a grid of items and add/remove cart functionality using local state. No payments or complex filters.",
  },
] as const;