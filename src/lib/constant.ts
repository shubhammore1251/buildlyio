export const SANBOX_TIMEOUT = 60_000 * 10 * 3; // 30MINS in MS


export const PROJECT_TEMPLATES = [
  {
    emoji: "🎬",
    title: "Simple movie browser",
    prompt:
      "Build a simple movie browsing UI with a hero section, a few movie rows, and a basic details modal using mock data and local state. Keep the layout clean and minimal. Dark mode.",
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
    emoji: "🗂️",
    title: "Basic file explorer",
    prompt:
      "Build a simple file explorer showing folders and files using mock data. Support rename and delete actions with local state. Focus on clarity, not advanced features.",
  },
  {
    emoji: "📺",
    title: "Video listing page",
    prompt:
      "Build a basic video listing page with thumbnail cards and a simple preview modal using mock data and local state. Avoid sidebars and extra navigation.",
  },
  {
    emoji: "🛍️",
    title: "Simple product listing",
    prompt:
      "Build a simple product listing page with a grid of items and add/remove cart functionality using local state. No payments or complex filters.",
  },
  {
    emoji: "🏡",
    title: "Property listings UI",
    prompt:
      "Build a basic property listings grid with mock data and a details modal using local state. Keep filters minimal or static. Clean card layout.",
  },
  {
    emoji: "🎵",
    title: "Music player UI",
    prompt:
      "Build a lightweight music player UI with a song list and play/pause state using local data. No audio streaming. Dark mode, simple controls.",
  },
] as const;


// export const PROJECT_TEMPLATES = [
//   {
//     emoji: "🎬",
//     title: "Build a Netflix clone",
//     prompt:
//       "Build a Netflix-style homepage with a hero banner (use a nice, dark-mode compatible gradient here), movie sections, responsive cards, and a modal for viewing details using mock data and local state. Use dark mode.",
//   },
//   {
//     emoji: "📦",
//     title: "Build an admin dashboard",
//     prompt:
//       "Create an admin dashboard with a sidebar, stat cards, a chart placeholder, and a basic table with filter and pagination using local state. Use clear visual grouping and balance in your design for a modern, professional look.",
//   },
//   {
//     emoji: "📋",
//     title: "Build a kanban board",
//     prompt:
//       "Build a kanban board with drag-and-drop using react-beautiful-dnd and support for adding and removing tasks with local state. Use consistent spacing, column widths, and hover effects for a polished UI.",
//   },
//   {
//     emoji: "🗂️",
//     title: "Build a file manager",
//     prompt:
//       "Build a file manager with folder list, file grid, and options to rename or delete items using mock data and local state. Focus on spacing, clear icons, and visual distinction between folders and files.",
//   },
//   {
//     emoji: "📺",
//     title: "Build a YouTube clone",
//     prompt:
//       "Build a YouTube-style homepage with mock video thumbnails, a category sidebar, and a modal preview with title and description using local state. Ensure clean alignment and a well-organized grid layout.",
//   },
//   {
//     emoji: "🛍️",
//     title: "Build a store page",
//     prompt:
//       "Build a store page with category filters, a product grid, and local cart logic to add and remove items. Focus on clear typography, spacing, and button states for a great e-commerce UI.",
//   },
//   {
//     emoji: "🏡",
//     title: "Build an Airbnb clone",
//     prompt:
//       "Build an Airbnb-style listings grid with mock data, filter sidebar, and a modal with property details using local state. Use card spacing, soft shadows, and clean layout for a welcoming design.",
//   },
//   {
//     emoji: "🎵",
//     title: "Build a Spotify clone",
//     prompt:
//       "Build a Spotify-style music player with a sidebar for playlists, a main area for song details, and playback controls. Use local state for managing playback and song selection. Prioritize layout balance and intuitive control placement for a smooth user experience. Use dark mode.",
//   }
// ] as const;