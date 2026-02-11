<!-- OPENSPEC:START -->
# OpenSpec 使用说明

这些说明适用于在此项目中工作的AI助手。

## 语言偏好设置

**默认使用中文**：除非明确说明使用英文，否则所有输出都应使用中文，包括：
- 文档内容
- 代码注释
- 提交信息
- 规范说明

## 工作流程

当请求满足以下条件时，始终打开`@/openspec/AGENTS.md`：
- 提及规划或提案（如提案、规范、变更、计划等词语）
- 引入新功能、重大变更、架构变更或大型性能/安全工作时
- 听起来不明确，需要在编码前了解权威规范时

使用`@/openspec/AGENTS.md`了解：
- 如何创建和应用变更提案
- 规范格式和约定
- 项目结构和指南

保持此托管块，以便'openspec-cn update'可以刷新说明。

<!-- OPENSPEC:END -->

# AGENTS.md

## Build, Test, and Lint Commands

### Backend (Spring Boot 3 + Java 21)
```bash
cd igreen-backend
./mvnw spring-boot:run              # Run dev server with auto-reload
java -jar target/igreen-backend-1.0.0.jar  # Production
mysql -u root -p < init-scripts/01-schema.sql  # Initialize database
```

### Backend - Legacy (FastAPI - 待迁移)
```bash
cd backend
python main.py                    # Run dev server with auto-reload
uvicorn main:app --reload         # Alternative dev server
```

### Frontend - iGreenApp (Engineer Mobile APP)
```bash
cd iGreenApp
npm install                       # Install dependencies
npm run dev                       # Start dev server (port 3000)
npm run build                     # Production build
```

### Frontend - iGreenticketing (Admin System)
```bash
cd iGreenticketing
npm install                       # Install dependencies
npm run dev                       # Start dev server
npm run build                     # Production build
```

### Testing
No test framework currently configured. When adding tests:
- Backend: Use pytest with pytest-asyncio
- Frontend: Use Vitest (included with Vite)

### Linting
No linting currently configured. Consider adding:
- Backend: ruff or black for Python
- Frontend: ESLint + Prettier for TypeScript/React

---

## Code Style Guidelines

### General Principles
- Keep components and functions focused and single-purpose
- Use existing patterns and libraries from the codebase
- Follow the established folder structure
- Prioritize mobile-first responsive design for iGreenApp

### React/TypeScript (Frontend)

#### Component Structure
- Use functional components with hooks (useState, useEffect, useMemo, useCallback)
- Define TypeScript interfaces for props before the component
- Export components with named exports: `export function ComponentName() {}`
- Main app entry point uses default export: `export default function App() {}`

#### Naming Conventions
- Components: PascalCase (Dashboard, TicketList, TicketDetail)
- Functions/Handlers: camelCase with handle prefix (handleLogin, loadTickets, handleTicketClick)
- Constants: UPPER_SNAKE_CASE (MOCK_TICKETS, API_BASE_URL)
- Types/Interfaces: PascalCase (Ticket, UserProfile, TicketStatus)
- State variables: camelCase (isAuthenticated, currentView, selectedTicket)

#### Imports Order
1. External React/core imports first
2. Third-party libraries (lucide-react, @radix-ui/*)
3. Local components from ../components/
4. Local utilities/lib from ../lib/

```typescript
import React, { useState, useEffect } from 'react';
import { Button } from "./components/ui/button";
import { Dashboard } from './components/Dashboard';
import { api } from './lib/api';
import { Ticket, TicketStatus } from './lib/data';
```

#### Styling
- Use Tailwind CSS utility classes exclusively
- Component variants use class-variance-authority (CVA) for UI components
- Apply cn() helper for conditional class merging
- Use slate color palette as base: slate-50, slate-900, slate-500, etc.
- Indigo/primary colors for actions: indigo-600, bg-indigo-500

#### Error Handling
- Use try/catch blocks for async operations
- Show user-friendly toast notifications via sonner: `toast.error("Message")`
- Handle 401 errors by redirecting to login and clearing auth token
- Use optimistic updates with rollback on API failure (see App.tsx:108-134)

#### State Management
- Use React hooks for local state
- Use optimistic updates for better UX (update UI immediately, revert if API fails)
- Keep API calls in dedicated functions in lib/api.ts
- Use URL search params or query strings for pagination (offset, limit)

### Python/FastAPI (Legacy Backend - 待迁移)

#### Structure (FastAPI - 已迁移至 Spring Boot)
- Legacy: Use Pydantic models for request/response validation in app/schemas/
- Legacy: Use SQLAlchemy ORM models in app/models/
- API endpoints in app/api/ with FastAPI routers
- Core config, database, security in app/core/
- Helper functions and utilities in app/utils/

#### Current: Spring Boot 3 + Java 21
- Use JPA entities in com.igreen.domain.entity/
- Use DTOs in com.igreen.domain.dto/
- API endpoints in com.igreen.domain.controller/
- Core config, database, security in com.igreen.common/
- Mapper XML files in resources/mapper/

#### API Design (Current: Spring Boot)
- Use RESTful conventions
- Use `@RestController` and `@RequestMapping` annotations
- Return `ResponseEntity<Result<T>>` for consistent response format
- Use Spring Security for authentication and authorization

---

## Project Structure

```
iGreenProduct/
├── igreen-backend/               # Spring Boot 3 backend (Java 21)
│   ├── src/main/java/com/igreen/
│   │   ├── domain/
│   │   │   ├── controller/       # REST API controllers
│   │   │   ├── entity/           # JPA entities
│   │   │   ├── dto/              # Data transfer objects
│   │   │   ├── enums/            # Enumerations
│   │   │   ├── mapper/           # MyBatis mappers
│   │   │   └── service/          # Business logic
│   │   └── common/
│   │       ├── config/           # Configuration classes
│   │       ├── exception/        # Exception handling
│   │       ├── result/           # Response wrappers
│   │       └── utils/            # Utility classes
│   ├── src/main/resources/
│   │   ├── mapper/               # MyBatis XML mappers
│   │   └── application.yml       # Application configuration
│   └── init-scripts/             # Database initialization
│
├── iGreenApp/                    # Engineer Mobile APP
│   └── src/
│       ├── components/        # React components
│       │   ├── ui/           # shadcn/ui components
│       │   └── [Feature].tsx # Feature components
│       ├── lib/              # API client, types, utils
│       ├── App.tsx           # Main app component
│       └── main.tsx          # Entry point
│
└── iGreenticketing/           # Admin Ticketing System
    └── src/
        ├── components/       # React components
        ├── lib/             # API client, types, mock data
        ├── App.tsx          # Main app component
        └── main.tsx         # Entry point
```

## Key Patterns

### API Client Pattern
Use centralized API client in lib/api.ts with fetchWithAuth helper:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}
```

### Type Definitions
Use union types for enums and interfaces for objects:
```typescript
export type TicketStatus = 'open' | 'assigned' | 'departed' | 'arrived' | 'review' | 'completed';
export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  // ...
}
```

## Important Notes

### File Size Formatting
Use `@lib/core/services/file_path_manager.dart` for formatting file sizes (not found in current repo - may need to be implemented)

### Git Branch Naming
Create branches with date prefix: `YYYYMMDD_description` (e.g., `20251225_add-user-auth`)

### Developer Info
- Current developer: litengfei
- Project language: Chinese (documentation in Chinese, code in English)

### Configuration
- Backend: Use .env for environment variables
- Frontend: Use VITE_API_URL environment variable for backend API URL
- Default backend URL: http://localhost:8000

### UI Components
- Use shadcn/ui components from components/ui/
- Icons from lucide-react
- Toast notifications via sonner
- Use Badge component for status/priority indicators

### Data Flow
- iGreenApp: Uses centralized API client calling backend endpoints
- iGreenticketing: Currently uses mock data, needs integration with backend
- Both share similar Ticket/Type structures but may have slight differences
