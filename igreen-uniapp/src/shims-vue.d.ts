/// <reference types="@dcloudio/types" />

// TypeScript shim for Vue files - HBuilderX compatible
// This file tells TypeScript how to handle Vue component imports

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
