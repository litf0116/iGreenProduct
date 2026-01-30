// Simple state management using uni-app's built-in storage
// No external dependencies required

import type { UserProfile, Ticket } from '@/types/ticket'

// User state
const USER_STORAGE_KEY = 'user'
const AUTH_TOKEN_KEY = 'auth_token'

export function getUser(): UserProfile | null {
  try {
    const user = uni.getStorageSync(USER_STORAGE_KEY)
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export function setUser(user: UserProfile): void {
  uni.setStorageSync(USER_STORAGE_KEY, JSON.stringify(user))
}

export function getAuthToken(): string | null {
  try {
    const token = uni.getStorageSync(AUTH_TOKEN_KEY)
    return token || null
  } catch {
    return null
  }
}

export function setAuthToken(token: string): void {
  uni.setStorageSync(AUTH_TOKEN_KEY, token)
}

export function clearAuth(): void {
  uni.removeStorageSync(USER_STORAGE_KEY)
  uni.removeStorageSync(AUTH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!(getUser() && getAuthToken())
}

// Ticket state (simple in-memory cache)
let ticketCache: Ticket[] = []
let currentTicketCache: Ticket | null = null

export function getCachedTickets(): Ticket[] {
  return ticketCache
}

export function setCachedTickets(tickets: Ticket[]): void {
  ticketCache = tickets
}

export function getCurrentTicket(): Ticket | null {
  return currentTicketCache
}

export function setCurrentTicket(ticket: Ticket | null): void {
  currentTicketCache = ticket
}

// For backward compatibility, export these as null (Pinia will not be used)
export const useUserStore = () => ({
  user: { value: null },
  isAuthenticated: { value: false },
  initFromStorage: () => {},
  login: async () => {},
  logout: () => {},
  fetchCurrentUser: async () => {},
})

export const useTicketStore = () => ({
  tickets: { value: [] },
  currentTicket: { value: null },
  loading: { value: false },
  refreshing: { value: false },
  loadingMore: { value: false },
  hasMore: { value: true },
  stats: { value: { total: 0, open: 0, inProgress: 0, completed: 0 } },
  loadTickets: async () => {},
  loadTicket: async () => {},
  acceptTicket: async () => {},
  declineTicket: async () => {},
  departTicket: async () => {},
  arriveTicket: async () => {},
  completeTicket: async () => {},
  loadStats: async () => {},
  setCurrentTicket: () => {},
})
