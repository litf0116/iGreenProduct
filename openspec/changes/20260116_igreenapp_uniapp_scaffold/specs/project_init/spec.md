# Project Initialization Specification

## Overview

Define the project initialization process and configuration requirements.

## ADDED Requirements

### Requirement: Package Configuration

The system SHALL configure the `package.json` file with proper dependencies and scripts.

#### Scenario: Configure package.json

**Given** a new uni-app project
**When** creating `package.json`
**Then** include the following scripts:
```json
{
  "scripts": {
    "dev:h5": "uni -p h5",
    "dev:app-plus": "uni -p app-plus",
    "dev:mp-weixin": "uni -p mp-weixin",
    "build:h5": "uni build",
    "build:app-plus": "uni build --platform app-plus",
    "build:mp-weixin": "uni build --platform mp-weixin"
  }
}
```

#### Scenario: Configure dependencies

**Given** package.json is being configured
**When** adding uni-app dependencies
**Then** include:
- `@dcloudio/uni-app`
- `@dcloudio/uni-h5`
- `vue@3`
- `pinia` (for state management)
- `sass` (for styles)

### Requirement: TypeScript Configuration

The system SHALL configure TypeScript for type safety.

#### Scenario: Create tsconfig.json

**Given** TypeScript support is required
**When** creating `tsconfig.json`
**Then** include the following configuration:
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "node",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "useDefineForClassFields": true,
    "lib": ["esnext", "dom"],
    "types": ["@dcloudio/types"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

### Requirement: Vue Configuration

The system SHALL configure Vue CLI for the project.

#### Scenario: Create vue.config.js

**Given** Vue CLI configuration is needed
**When** creating `vue.config.js`
**Then** include uni-app specific configuration:
```javascript
const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  chainWebpack(config) {
    config.module
      .rule('scss')
      .oneOf('normal')
      .use('sass-loader')
      .tap(options => {
        options.scssOptions = {
          additionalData: `@import "@/uni.scss";`
        }
        return options
      })
  }
}
```

### Requirement: Git Configuration

The system SHALL configure git for version control.

#### Scenario: Create .gitignore

**Given** git is used for version control
**When** creating `.gitignore`
**Then** include the following:
```
# Node modules
node_modules/

# Build outputs
dist/
dist.zip

# IDE
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Local env
.env
.env.local
.env.*.local

# Uni-app
unpackage/
```

#### Scenario: Initialize git repository

**Given** project is created
**When** running `git init`
**Then** create `.git` directory
**And** create initial commit
