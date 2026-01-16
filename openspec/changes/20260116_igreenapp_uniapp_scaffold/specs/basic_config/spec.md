# Basic Configuration Specification

## Overview

Define the basic configuration files required for the uni-app project.

## ADDED Requirements

### Requirement: Manifest Configuration

The system SHALL configure the application manifest (`manifest.json`) with proper settings.

#### Scenario: Configure application name

**Given** manifest.json is being configured
**When** setting application name
**Then** set name to "iGreen+"

#### Scenario: Configure version

**Given** manifest.json is being configured
**When** setting version information
**Then** set versionName to "1.0.0"
**And** set versionCode to "100"

#### Scenario: Configure H5 settings

**Given** manifest.json is being configured
**When** configuring H5 platform settings
**Then** set title to "iGreen+"
**And** configure router to hash mode
**And** set base path to "./"
**And** configure devServer on port 3000

### Requirement: Pages Configuration

The system SHALL configure the pages routing (`pages.json`).

#### Scenario: Configure default page

**Given** pages.json is being configured
**When** setting up the default page
**Then** configure index page:
```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ]
}
```

#### Scenario: Configure global style

**Given** pages.json is being configured
**When** setting global style
**Then** configure:
```json
{
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "iGreen+",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f8f8f8",
    "app-plus": {
      "background": "#efeff4"
    }
  }
}
```

### Requirement: Global Styles

The system SHALL configure global SCSS styles (`uni.scss`).

#### Scenario: Define theme colors

**Given** uni.scss is being created
**When** defining theme variables
**Then** define:
```scss
// Primary Colors
$primary-color: #0d9488; // teal-600
$primary-light: #14b8a6;
$primary-dark: #0f766e;

// Status Colors
$success-color: #22c55e;
$warning-color: #f59e0b;
$error-color: #ef4444;
$info-color: #3b82f6;

// Neutral Colors
$white: #ffffff;
$black: #000000;
$gray-50: #f8fafc;
$gray-100: #f1f5f9;
$gray-200: #e2e8f0;
$gray-300: #cbd5e1;
$gray-400: #94a3b8;
$gray-500: #64748b;
$gray-600: #475569;
$gray-700: #334155;
$gray-800: #1e293b;
$gray-900: #0f172a;
```

#### Scenario: Define utility classes

**Given** uni.scss is being created
**When** defining utility classes
**Then** include:
```scss
// Flex utilities
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }

// Spacing
.m-0 { margin: 0; }
.m-1 { margin: 4px; }
.m-2 { margin: 8px; }
.m-4 { margin: 16px; }
.p-0 { padding: 0; }
.p-1 { padding: 4px; }
.p-2 { padding: 8px; }
.p-4 { padding: 16px; }

// Text
.text-center { text-align: center; }
.text-bold { font-weight: bold; }
.text-sm { font-size: 14px; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 24px; }
.text-primary { color: $primary-color; }
.text-gray { color: $gray-500; }

// Background
.bg-white { background-color: $white; }
.bg-gray { background-color: $gray-100; }
.bg-primary { background-color: $primary-color; }
```

#### Scenario: Import global styles in App.vue

**Given** App.vue is being created
**When** importing global styles
**Then** include:
```vue
<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
```

### Requirement: Main Entry Configuration

The system SHALL configure the main entry file (`main.ts`).

#### Scenario: Configure main.ts

**Given** main.ts is being created
**When** setting up the application
**Then** include:
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

### Requirement: Index Page Configuration

The system SHALL configure the default index page.

#### Scenario: Create index.vue

**Given** index page is being created
**When** setting up the basic structure
**Then** include:
```vue
<template>
  <view class="container">
    <text class="title">Welcome to iGreen+</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  console.log('Index page loaded')
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #0d9488;
}
</style>
```

### Requirement: README Documentation

The system SHALL create project documentation.

#### Scenario: Create README.md

**Given** README.md is being created
**When** documenting the project
**Then** include:
```markdown
# iGreen+ UniApp

iGreen+ Engineer Mobile App built with uni-app.

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev:h5

# Build for H5
npm run build:h5
```

## Project Structure

```
src/
├── pages/           # Page components
├── components/      # Reusable components
├── utils/           # Utility functions
├── store/           # Pinia stores
├── static/          # Static assets
├── App.vue          # App entry
└── main.ts          # JS entry
```

## Tech Stack

- uni-app 3.x
- Vue 3
- TypeScript
- Pinia
- SCSS
```
