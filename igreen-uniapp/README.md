# iGreen+ UniApp

iGreen+ Engineer Mobile App built with uni-app framework.

## Quick Start

```bash
# Install dependencies
npm install

# Development (H5)
npm run dev:h5

# Development (App)
npm run dev:app-plus

# Development (WeChat Mini Program)
npm run dev:mp-weixin

# Build for H5
npm run build:h5

# Build for App
npm run build:app-plus

# Build for WeChat Mini Program
npm run build:mp-weixin
```

## Project Structure

```
igreen-uniapp/
├── src/
│   ├── App.vue              # App entry component
│   ├── main.ts              # JS entry file
│   ├── pages.json           # Pages configuration
│   ├── manifest.json        # App manifest configuration
│   ├── uni.scss             # Global SCSS styles
│   ├── pages/               # Page components
│   │   └── index/
│   │       └── index.vue    # Index page
│   ├── components/          # Reusable components
│   │   ├── ui/              # UI components
│   │   └── business/        # Business components
│   ├── utils/               # Utility functions
│   ├── store/               # Pinia stores
│   └── static/              # Static assets
├── public/                  # Public assets
├── package.json
├── tsconfig.json
├── vue.config.js
└── README.md
```

## Tech Stack

- **Framework**: uni-app 3.x (Vue3)
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: SCSS
- **UI Components**: uView UI Plus (to be added)

## Theme

The app uses a teal-600 (#0d9488) primary color scheme, matching the iGreenApp design.

## License

Private project - All rights reserved.
