# Blueprint.dev

Blueprint.dev is a comprehensive AI-powered platform designed to streamline the software development lifecycle. Starting from a simple Product Requirements Document (PRD), it automatically analyzes requirements, detects ambiguities, and bridges the gap between product documentation and engineering implementation.

## 🚀 Key Features

- **🪄 Intelligent PRD Parsing**: Upload your product requirements and let the system extract core features, user stories, and acceptance criteria automatically using Google's Gemini LLM.
- **🔍 Ambiguity Detection & Clarification**: Automatically detect missing details or contradictions in your PRD. The built-in "Chat & Clarify" AI assistant helps resolve these ambiguities interactively.
- **🏗️ Architecture Topology Diagram**: Generates a visual Node-based architecture diagram from your requirements, connecting user stories to database models, components, and APIs.
- **🔗 Traceability Matrix**: Tracks your features across the entire lifecycle, ensuring every requirement is mapped directly to a user story, architecture component, test case, and sprint task.
- **💻 Code Generation**: Instantly generate boilerplate code based on the accepted product architecture and integrated with your preferred stack.
- **🔄 Task Management & Sprint Planning**: Organizes the extracted tasks into structured sprints. Includes two-way synchronization with ClickUp integration.
- **🤖 Workflow Automations**: Easily integrate with third-party tools like:
  - **ClickUp**: Push generated tasks and stories directly to your ClickUp workspaces.
  - **GitHub / GitLab**: Auto-sync generated code and boilerplate to repositories.
  - **Slack**: Notify your team about ambiguities, sprint creations, or system updates.
- **⚡ Local IDE Integration**: Utilize the local bridge server to open your generated code directly in VS Code.

## 🛠️ Technology Stack

This project is a modern monorepo featuring a full-stack decoupled architecture.

### Frontend
- **Framework**: React 18 with Vite and TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **State Management**: React Query (TanStack Query), Zustand (likely used), native hooks
- **Visualizations**: React Flow (Xyflow) for architecture diagrams, Recharts for analytics
- **3D Elements**: Three.js & React Three Fiber (drei)

### Backend (`blueprint-backend`)
- **Framework**: Express.js with Node.js & TypeScript
- **Database ORM**: Prisma (connected to Supabase/PostgreSQL)
- **AI Integration**: Google Gen AI SDK (Gemini)
- **Local Integration**: A lightweight Node.js script (`bridge.js`) allowing direct file writes into a user's local filesystem and opening VS Code contexts.

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or bun
- API Keys for Google Gemini, Supabase (if using a hosted DB), and various integrations (Optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd architecture-assistant
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```
   
3. **Install backend dependencies:**
   ```bash
   cd blueprint-backend
   npm install
   ```

### Configuration

1. **Frontend Configuration:**
   Create a `.env` file in the root directory (or use `.env.local`) and configure your Supabase/Vite environment variables if necessary.

2. **Backend Configuration:**
   Inside the `blueprint-backend` folder, create a `.env` file with the following variables:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=your_prisma_database_connection_url
   # Other integration keys (ClickUp, Slack, GitHub)
   ```

### Development 

To run the application locally, you will need to start three separate processes:

**1. Start the React Frontend:**
```bash
# From the root directory
npm run dev
```

**2. Start the Express Backend:**
```bash
# From the blueprint-backend directory
npm run dev
```

**3. Start the Local IDE Bridge Server (Optional):**
Allows the app to write generated code and open VS Code.
```bash
# From the root directory
npm run bridge
```

## 📂 Project Structure

- `/src` - The Vite + React frontend application.
  - `/pages` - Core views like Analysis, Architecture, Traceability, Automation, Tasks.
  - `/components` - Reusable UI components from shadcn/ui.
  - `/hooks` & `/lib` - Application utilities and Supabase clients.
- `/blueprint-backend` - The Express backend application handling AI pipelines and requests.
  - `/src/lib/pipeline` - Modular pipeline scripts for processing PRDs, code generation, etc.
  - `/src/routes` - Express endpoint definitions.
  - `prisma/` - Database schema definitions.

## 🤝 Contribution

Contributions are welcome! Please make sure to check out our open issues before making a pull request.

## 📄 License
This project is open-source. Please check the LICENSE file for details.
