# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iGreen+ Ticketing System - A monorepo for EV charging station maintenance work order management.

**Frontend (igreen-front/)**: React 18.3.1 + TypeScript + Vite admin dashboard (port 3000)
**Backend (igreen-backend/)**: Spring Boot 3.2.0 + Java 21 REST API (port 8001)

```
/Users/mac/workspace/iGreenProduct/igreen-front/     # Frontend
/Users/mac/workspace/iGreenProduct/igreen-backend/       # Backend
```

## Build & Test Commands

### Frontend (igreen-front)
```bash
cd /Users/mac/workspace/iGreenProduct/igreen-front
pnpm install              # Install dependencies
pnpm dev                 # Start dev server on port 3000
pnpm build               # Production build to build/
```

### Backend (igreen-backend)
```bash
cd /Users/mac/workspace/iGreenProduct/igreen-backend
make help                # Show all available commands
make start               # Start Spring Boot app on port 8001
make build               # Build JAR file
make test                # Run unit tests
make api-test            # Run API integration tests
make init-db             # Initialize database with test data
make swagger             # Open Swagger UI at localhost:8001/swagger-ui.html
make clean               # Clean build artifacts
```

### Docker (Optional)
```bash
cd /Users/mac/workspace/iGreenProduct/igreen-backend
docker-compose up        # Start MySQL, Redis, and Backend
```

## Architecture

### Monorepo Layout
```
igreen-front/              # React Frontend (Admin System)
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (50+ Radix UI primitives)
│   │   └── [Feature].tsx    # Feature components
│   ├── lib/
│   │   ├── api.ts           # Centralized API client with fetchWithAuth
│   │   ├── types.ts         # TypeScript interfaces matching backend DTOs
│   │   └── i18n.ts          # Translations (en/zh)
│   └── App.tsx              # Main app with authentication flow
└── build/                   # Production build output

igreen-backend/               # Spring Boot Backend
├── src/main/java/com/igreen/
│   ├── common/              # Cross-cutting concerns
│   │   ├── config/          # Security, CORS, JWT filter
│   │   ├── exception/       # Global exception handler, error codes
│   │   ├── result/          # API response wrappers (Result<T>, PageResult<T>)
│   │   └── utils/           # JWT utilities
│   └── domain/              # Business logic
│       ├── controller/      # REST endpoints (@RestController)
│       ├── service/         # Business logic (@Service)
│       ├── repository/      # Data access (JPA/MyBatis)
│       ├── entity/          # JPA entities with Lombok @Builder
│       ├── dto/             # Request/Response objects
│       └── enums/           # Enum definitions
└── scripts/                 # Database scripts
```

### API Communication
- **Base URL**: Configured via `VITE_API_URL` environment variable (default: `http://localhost:8000`)
- **Authentication**: JWT Bearer tokens stored in `localStorage.getItem('auth_token')`
- **Response Format**: `{ success: boolean, message: string, data: T, code: string }`
- **Error Handling**: 401 → redirect to login, other errors → toast notification

### Authentication Flow
1. Login via `api.login(username, password, country)` → stores JWT in localStorage
2. All subsequent requests include `Authorization: Bearer {token}` header via `fetchWithAuth()` wrapper
3. 401 responses trigger logout and redirect to `/login`
4. Token validated on app mount via `api.getCurrentUser()`

## Key Patterns

### Backend Patterns
- **Layered Architecture**: Controller → Service → Repository → Entity
- **DTO Pattern**: Separate Request/Response DTOs in `domain/dto/`
- **Builder Pattern**: All entities use Lombok `@Builder` for construction
- **Pagination**: `PageResult<T>` wrapper with `records`, `total`, `current`, `size`, `hasNext`
- **Exception Handling**: `GlobalExceptionHandler` with `BusinessException` and `ErrorCode` enum
- **Security**: JWT-based stateless authentication with `JwtAuthenticationFilter`
- **Role-Based Access**: `@PreAuthorize` annotations on controller methods (ADMIN, MANAGER, ENGINEER)

### Frontend Patterns
- **Functional Components**: All components use React hooks (useState, useEffect, useCallback)
- **TypeScript First**: Strict mode enabled, interface definitions in `lib/types.ts` mirroring backend DTOs
- **API Client**: Centralized in `lib/api.ts` with `fetchWithAuth()` helper for automatic token injection
- **i18n**: Translation system via `translations[language][key]` pattern
- **State Management**: React hooks for local state, no global state library
- **Component Library**: shadcn/ui (Radix UI primitives + Tailwind styling)
- **Forms**: react-hook-form for form management
- **Notifications**: sonner for toast messages

## Developer Conventions

### Branch Naming
- **Format**: `YYYYMMDD_description` (e.g., `20250111_add-ticket-filtering`)
- **Current Developer**: litengfei

### Code Style
- **TypeScript**: Strict mode, path aliases (`@/*` → `./src/*`)
- **Java**: Lombok annotations for getters/setters/builders
- **CSS**: Tailwind utility classes exclusively
- **Documentation**: Chinese (README, comments)
- **Code**: English (variable names, function names, API endpoints)
- **UI**: Bilingual support (en/zh) via i18n system

## Critical Files

### Configuration
- `/Users/mac/workspace/iGreenProduct/igreen-front/vite.config.ts` - Vite config with path aliases
- `/Users/mac/workspace/iGreenProduct/igreen-front/tsconfig.json` - TypeScript strict mode config
- `/Users/mac/workspace/iGreenProduct/igreen-backend/pom.xml` - Maven dependencies
- `/Users/mac/workspace/iGreenProduct/igreen-backend/src/main/resources/application.yml` - Spring config

### Key Source Files
- `/Users/mac/workspace/iGreenProduct/igreen-front/src/lib/api.ts` - Central API client (600+ lines)
- `/Users/mac/workspace/iGreenProduct/igreen-front/src/lib/types.ts` - Type definitions
- `/Users/mac/workspace/iGreenProduct/igreen-front/src/App.tsx` - Main app component
- `/Users/mac/workspace/iGreenProduct/igreen-backend/src/main/java/com/igreen/common/config/SecurityConfig.java` - Security config

## Common Tasks

### Adding New API Endpoint
1. Create DTO in `igreen-backend/src/main/java/com/igreen/domain/dto/`
2. Add entity in `igreen-backend/src/main/java/com/igreen/domain/entity/` if needed
3. Create repository in `igreen-backend/src/main/java/com/igreen/domain/repository/`
4. Implement service in `igreen-backend/src/main/java/com/igreen/domain/service/`
5. Add controller in `igreen-backend/src/main/java/com/igreen/domain/controller/`
6. Add TypeScript types in `igreen-front/src/lib/types.ts`
7. Add API methods in `igreen-front/src/lib/api.ts`

### Adding New Frontend Component
1. Create component in `igreen-front/src/components/`
2. Use shadcn/ui components from `components/ui/`
3. Follow naming: PascalCase for components, camelCase for handlers
4. Add TypeScript interfaces for props
5. Export with named export: `export function ComponentName() {}`

### Running Tests
- **Backend**: `make test` (unit tests) or `make api-test` (integration tests, requires backend running)
- **Frontend**: No test framework configured yet

## Technology Stack

### Frontend
- React 18.3.1 with TypeScript
- Vite 6.3.5 (build tool)
- pnpm (package manager)
- Radix UI components (@radix-ui/*)
- Tailwind CSS (styling)
- lucide-react (icons)
- sonner (toast notifications)
- react-hook-form (forms)
- recharts (charts)

### Backend
- Spring Boot 3.2.0
- Java 21
- Spring Security (JWT authentication)
- Spring Data JPA + MyBatis Plus
- MySQL 8.0
- Lombok 1.18.30
- Swagger/OpenAPI 2.3.0
