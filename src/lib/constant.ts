export const SANBOX_TIMEOUT = 60_000 * 10 * 3; // 30MINS in MS

export const PROJECT_TEMPLATES = [
  {
    emoji: "🎬",
    title: "Build a Netflix clone",
    prompt:
      "Build a Netflix-style homepage with a hero banner (use a nice, dark-mode compatible gradient here), movie sections, responsive cards, and a modal for viewing details using mock data and local state. Use dark mode.",
  },
  {
    emoji: "📦",
    title: "Build an admin dashboard",
    prompt:
      "Create an admin dashboard with a sidebar, stat cards, a chart placeholder, and a basic table with filter and pagination using local state. Use clear visual grouping and balance in your design for a modern, professional look.",
  },
  {
    emoji: "📋",
    title: "Build a kanban board",
    prompt:
      "Build a kanban board with drag-and-drop using react-beautiful-dnd and support for adding and removing tasks with local state. Use consistent spacing, column widths, and hover effects for a polished UI.",
  },
  {
    emoji: "🗂️",
    title: "Build a file manager",
    prompt:
      "Build a file manager with folder list, file grid, and options to rename or delete items using mock data and local state. Focus on spacing, clear icons, and visual distinction between folders and files.",
  },
  {
    emoji: "📺",
    title: "Build a YouTube clone",
    prompt:
      "Build a YouTube-style homepage with mock video thumbnails, a category sidebar, and a modal preview with title and description using local state. Ensure clean alignment and a well-organized grid layout.",
  },
  {
    emoji: "🛍️",
    title: "Build a store page",
    prompt:
      "Build a store page with category filters, a product grid, and local cart logic to add and remove items. Focus on clear typography, spacing, and button states for a great e-commerce UI.",
  },
  {
    emoji: "🏡",
    title: "Build an Airbnb clone",
    prompt:
      "Build an Airbnb-style listings grid with mock data, filter sidebar, and a modal with property details using local state. Use card spacing, soft shadows, and clean layout for a welcoming design.",
  },
  {
    emoji: "🎵",
    title: "Build a Spotify clone",
    prompt:
      "Build a Spotify-style music player with a sidebar for playlists, a main area for song details, and playback controls. Use local state for managing playback and song selection. Prioritize layout balance and intuitive control placement for a smooth user experience. Use dark mode.",
  }
] as const;


// export const PROJECT_TEMPLATES = [
//   {
//     emoji: "🎬",
//     title: "Build a Netflix clone",
//     prompt:
//       "Create a Netflix-style homepage with a hero section and movie cards using mock data. Clicking a movie should open a simple detail view showing title and description. Use dark mode and local state.",
//   },
//   {
//     emoji: "📦",
//     title: "Basic admin dashboard",
//     prompt:
//       "Create a lightweight admin dashboard with a sidebar, 3–4 stat cards, and a simple table using mock data and local state. No charts or complex logic. Clean and professional UI.",
//   },
//   {
//     emoji: "📋",
//     title: "Minimal kanban board",
//     prompt:
//       "Build a minimal kanban board with 3 columns and basic drag-and-drop using local state. Support adding and deleting tasks only. Keep styling simple and consistent.",
//   },
//   {
//     emoji: "🛍️",
//     title: "Simple product listing",
//     prompt:
//       "Build a simple product listing page with a grid of items and add/remove cart functionality using local state. No payments or complex filters.",
//   },
// ] as const;