# Comic Book Creator

## Overview

A web-based comic book creation tool that transforms text scripts into visual comic panels using AI. Users write story scripts, define characters, and the application uses Gemini AI to break down narratives into panel descriptions and generate corresponding images. The editor supports drag-and-drop speech bubbles for adding dialogue to completed panels.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, with polling for real-time panel generation status
- **UI Components**: shadcn/ui component library with Radix UI primitives, styled with Tailwind CSS
- **Drag-and-Drop**: Framer Motion for draggable speech bubbles on comic panels
- **Design Theme**: Comic book aesthetic with custom fonts (Bangers, Architects Daughter) and bold borders

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation schemas
- **Async Processing**: Panel image generation runs asynchronously after story creation, with status polling from frontend

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Managed via `drizzle-kit push` command
- **Tables**: stories, panels, characters, speechBubbles with relational connections

### AI Integration
- **Provider**: Google Gemini via Replit AI Integrations
- **Text Analysis**: `gemini-2.5-flash` breaks story scripts into panel descriptions
- **Image Generation**: `gemini-2.5-flash-image` creates comic panel artwork
- **Client Setup**: Custom GoogleGenAI client configured with Replit-provided environment variables

### Key Data Flow
1. User submits story script with characters and style preferences
2. Backend creates story record, returns immediately
3. Background process analyzes script with Gemini to generate panel descriptions
4. Each panel triggers image generation, status updates stored in database
5. Frontend polls for status changes, displays panels as they complete
6. User can add/position speech bubbles on completed panels

## External Dependencies

### AI Services
- **Replit AI Integrations**: Provides Gemini API access via `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL` environment variables
- **Models Used**: gemini-2.5-flash (text), gemini-2.5-flash-image (images)

### Database
- **PostgreSQL**: Connection via `DATABASE_URL` environment variable
- **Session Storage**: connect-pg-simple for Express sessions (if authentication is added)

### Key NPM Packages
- `@google/genai`: Official Google Generative AI SDK
- `drizzle-orm` / `drizzle-kit`: Database ORM and migration tooling
- `framer-motion`: Animation and drag interactions
- `@tanstack/react-query`: Async state management with polling support
- `wouter`: Minimal React router
- `zod`: Runtime type validation for API contracts