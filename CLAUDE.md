# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iGreen+ EV Charging Station Maintenance System - A monorepo containing a Spring Boot REST API backend and multiple React-based frontend applications for managing EV charging station maintenance work orders.

## Build & Test Commands

### Backend (Spring Boot)
```bash
cd igreen-backend
make help                # Show all available commands
make start               # Start Spring Boot app on port 8000
make build               # Build JAR file
make test                # Run unit tests
make api-test            # Run API integration tests (requires backend running)
make init-db             # Initialize database with test data
make swagger             # Open Swagger UI at localhost:8000/swagger-ui.html
make clean               # Clean build artifacts
```

### Frontend Applications
All frontends use pnpm as the package manager.

```bash
# Admin Ticketing System
cd igreen-front
pnpm install && pnpm dev   # Start dev server on port 3000
pnpm build                 # Production build to build/

# Engineer App
cd iGreenApp
pnpm install && pnpm dev   # Start dev server
pnpm build                 # Production build

# Other frontends (receive_app, sned_app)
pnpm install && pnpm dev
pnpm build
```

### Docker
```bash
cd igreen-backend
docker-compose up        # Start MySQL, Redis, and Backend
```

## Architecture

### Monorepo Structure
```
igreen-backend/           # Spring Boot Backend (Java 21)
├── src/main/java/com/igreen/
│   ├── common/          # Cross-cutting (config, exception handling, JWT utils)
│   └── domain/          # Business logic (controller, service, repository, entity, dto)
└── Makefile             # Build automation

igreen-front/            # React Admin Dashboard (port 3000)
iGreenApp/              # React Engineer Mobile App
receive_app/            # Additional frontend
sned_app/               # Additional frontend
```

### Backend Architecture (Layered)
- **Controller**: REST endpoints (`@RestController`)
- **Service**: Business logic (`@Service`)
- **Repository**: Data access (JPA/MyBatis)
- **Entity**: JPA entities with Lombok `@Builder`
- **DTO**: Request/Response objects

### API Communication
- **Base URL**: Configured via `VITE_API_URL` environment variable (default: `http://localhost:8000`)
- **Authentication**: JWT Bearer tokens stored in `localStorage.getItem('auth_token')`
- **Response Format**: `{ success: boolean, message: string, data: T, code: string }`
- **Error Handling**: 401 → redirect to login, other errors → toast notification

### Authentication Flow
1. Login via `api.login(username, password, country)` → stores JWT in localStorage
2. All requests include `Authorization: Bearer {token}` via `fetchWithAuth()` wrapper
3. 401 responses trigger logout and redirect to `/login`

## Key Patterns

### Backend Patterns
- **DTO Pattern**: Separate Request/Response DTOs in `domain/dto/`
- **Pagination**: `PageResult<T>` wrapper with `records`, `total`, `current`, `size`
- **Exception Handling**: `GlobalExceptionHandler` with `BusinessException` and `ErrorCode` enum
- **Security**: JWT-based stateless authentication with `JwtAuthenticationFilter`
- **Role-Based Access**: `@PreAuthorize` annotations (ADMIN, MANAGER, ENGINEER roles)

### Frontend Patterns
- **Functional Components**: React hooks (useState, useEffect, useCallback)
- **TypeScript Strict Mode**: Interface definitions mirroring backend DTOs
- **API Client**: Centralized in `lib/api.ts` with `fetchWithAuth()` for automatic token injection
- **Component Library**: shadcn/ui (Radix UI primitives + Tailwind)
- **i18n**: Translation system via `translations[language][key]` pattern (en/zh)

## Developer Conventions

### Branch Naming
- **Format**: `YYYYMMDD_description` (e.g., `20250111_add-ticket-filtering`)
- **Current Developer**: litengfei

### Code Style
- **TypeScript**: Strict mode, path aliases (`@/*` → `./src/*`)
- **Java**: Lombok annotations for getters/setters/builders
- **CSS**: Tailwind utility classes exclusively
- **Documentation**: Chinese for user-facing text, English for code and API endpoints
- **UI**: Bilingual support (en/zh) via i18n system

## Critical Files

### Configuration
- `igreen-backend/pom.xml` - Maven dependencies
- `igreen-backend/src/main/resources/application.yml` - Spring config
- `igreen-front/vite.config.ts` - Vite config with path aliases

### Key Source Files
- `igreen-front/src/lib/api.ts` - Central API client
- `igreen-front/src/lib/types.ts` - Type definitions
- `igreen-backend/src/main/java/com/igreen/common/config/SecurityConfig.java` - Security config

## Common Tasks

### Adding New API Endpoint
1. Create DTO in `igreen-backend/src/main/java/com/igreen/domain/dto/`
2. Add entity in `igreen-backend/src/main/java/com/igreen/domain/entity/` if needed
3. Create repository in `igreen-backend/src/main/java/com/igreen/domain/repository/`
4. Implement service in `igreen-backend/src/main/java/com/igreen/domain/service/`
5. Add controller in `igreen-backend/src/main/java/com/igreen/domain/controller/`
6. Add TypeScript types in frontend `src/lib/types.ts`
7. Add API methods in frontend `src/lib/api.ts`

### Adding New Frontend Component
1. Create component in `src/components/`
2. Use shadcn/ui components from `components/ui/`
3. Follow naming: PascalCase for components, camelCase for handlers
4. Add TypeScript interfaces for props
5. Export with named export: `export function ComponentName() {}`

## Technology Stack

### Backend
- Spring Boot 3.2.0
- Java 21
- Spring Security (JWT authentication)
- Spring Data JPA + MyBatis Plus
- MySQL 8.0
- Lombok 1.18.30
- Swagger/OpenAPI 2.3.0

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

## Additional Documentation

- `/Users/mac/workspace/iGreenProduct/README.md` - Project overview and setup
- `/Users/mac/workspace/iGreenProduct/DEPLOYMENT_GUIDE.md` - Production deployment guide
- `/Users/mac/workspace/iGreenProduct/AGENTS.md` - Code style guidelines and patterns
- `/Users/mac/workspace/iGreenProduct/igreen-front/CLAUDE.md` - Frontend-specific guidance
