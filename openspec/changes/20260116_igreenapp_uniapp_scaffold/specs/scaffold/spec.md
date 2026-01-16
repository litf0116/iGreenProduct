# Scaffold Specification

## Overview

Define the project creation and initialization process using the official uni-app CLI scaffold.

## ADDED Requirements

### Requirement: Environment Check

The system SHALL verify the development environment meets the requirements before creating the project.

#### Scenario: Node.js version check

**Given** developer runs the project creation command
**When** Node.js version is less than 14
**Then** display warning message and abort creation

#### Scenario: npm version check

**Given** developer runs the project creation command
**When** npm version is less than 6
**Then** display warning message and suggest upgrade

### Requirement: Project Creation

The system SHALL create a new uni-app project using the official CLI scaffold.

#### Scenario: Create project with vue-cli

**Given** developer executes the vue-cli command
```bash
npx @vue/cli@latest create @dcloudio/uni-app igreen-uniapp --packageManager npm --typescript
```
**When** the command completes successfully
**Then** create project directory `igreen-uniapp`
**And** generate `package.json` with uni-app dependencies
**And** generate TypeScript configuration

#### Scenario: Create project with default options

**Given** developer runs interactive CLI
**When** developer selects Vue3 + TypeScript template
**Then** generate project with selected configurations

### Requirement: Dependency Installation

The system SHALL install all project dependencies automatically.

#### Scenario: Install production dependencies

**Given** project is created successfully
**When** running `npm install`
**Then** install all dependencies from `package.json`
**And** generate `node_modules` directory

#### Scenario: Install development dependencies

**Given** project dependencies are installed
**When** installing additional dev dependencies
**Then** add dependencies to `package.json`
**And** update `node_modules`

### Requirement: Project Structure

The system SHALL generate a standard uni-app project structure.

#### Scenario: Verify directory structure

**Given** project is created
**When** examining the project directory
**Then** the structure should match:
```
igreen-uniapp/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── pages.json
│   ├── manifest.json
│   ├── uni.scss
│   └── pages/
│       └── index/
│           └── index.vue
├── public/
├── package.json
├── tsconfig.json
├── vue.config.js
└── README.md
```

### Requirement: Development Server

The system SHALL provide a working development server.

#### Scenario: Start H5 development server

**Given** project dependencies are installed
**When** running `npm run dev:h5`
**Then** start development server on port 3000
**And** the server should be accessible at http://localhost:3000

#### Scenario: Hot module replacement

**Given** development server is running
**When** modifying source files
**Then** automatically reload the changes
**And** preserve application state
