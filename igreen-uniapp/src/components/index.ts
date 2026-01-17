import type { Component } from 'vue';

const components: Record<string, Component> = {};

function importAllComponents(componentsContext: __WebpackModuleApi.RequireContext) {
  componentsContext.keys().forEach((fileName) => {
    const componentConfig = componentsContext(fileName);
    const componentName = fileName
      .split('/')
      .pop()
      ?.replace(/\.\w+$/, '') || '';
    components[componentName] = componentConfig.default || componentConfig;
  });
}

const uiContext = import.meta.glob('./components/ui/*.vue', { eager: true });
const ticketsContext = import.meta.glob('./components/tickets/*.vue', { eager: true });

Object.keys(uiContext).forEach((fileName) => {
  const componentName = fileName
    .split('/')
    .pop()
    ?.replace(/\.\w+$/, '') || '';
  components[componentName] = (uiContext[fileName] as any).default || uiContext[fileName];
});

Object.keys(ticketsContext).forEach((fileName) => {
  const componentName = fileName
    .split('/')
    .pop()
    ?.replace(/\.\w+$/, '') || '';
  components[componentName] = (ticketsContext[fileName] as any).default || ticketsContext[fileName];
});

export function setupComponents(app: any) {
  for (const [name, component] of Object.entries(components)) {
    app.component(name, component);
  }
}

export { components };
