import { createPinia } from 'pinia';

const pinia = createPinia();

export function setupStore(app: any) {
  app.use(pinia);
}

export { useUserStore } from './modules/user';
export { useTicketStore } from './modules/tickets';
