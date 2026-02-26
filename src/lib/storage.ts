// =============================================================================
// CakeGen — localStorage Storage Layer
// Typed CRUD operations backed by localStorage.
// Each entity collection is stored under its own key.
// =============================================================================

import type { AppDatabase } from './types'

const STORAGE_PREFIX = 'cakegen:'

const COLLECTION_KEYS = [
  'users',
  'cakeRequests',
  'cakeConcepts',
  'themeCategories',
  'shareLinks',
  'comments',
  'bonanzaSchedules',
] as const

type CollectionName = (typeof COLLECTION_KEYS)[number]

// --- Low-level helpers ---

function getStorageKey(collection: CollectionName): string {
  return `${STORAGE_PREFIX}${collection}`
}

function readCollection<T>(collection: CollectionName): T[] {
  try {
    const raw = localStorage.getItem(getStorageKey(collection))
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch {
    console.error(`Failed to read ${collection} from localStorage`)
    return []
  }
}

function writeCollection<T>(collection: CollectionName, data: T[]): void {
  try {
    localStorage.setItem(getStorageKey(collection), JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to write ${collection} to localStorage`, error)
  }
}

// --- Generic CRUD ---

export function getAll<T extends { id: string }>(
  collection: CollectionName
): T[] {
  return readCollection<T>(collection)
}

export function getById<T extends { id: string }>(
  collection: CollectionName,
  id: string
): T | undefined {
  const items = readCollection<T>(collection)
  return items.find((item) => item.id === id)
}

export function create<T extends { id: string }>(
  collection: CollectionName,
  item: T
): T {
  const items = readCollection<T>(collection)
  items.push(item)
  writeCollection(collection, items)
  return item
}

export function update<T extends { id: string }>(
  collection: CollectionName,
  id: string,
  updates: Partial<T>
): T | undefined {
  const items = readCollection<T>(collection)
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return undefined
  items[index] = { ...items[index], ...updates }
  writeCollection(collection, items)
  return items[index]
}

export function remove(collection: CollectionName, id: string): boolean {
  const items = readCollection<{ id: string }>(collection)
  const filtered = items.filter((item) => item.id !== id)
  if (filtered.length === items.length) return false
  writeCollection(collection, filtered)
  return true
}

// --- Bulk operations ---

export function createMany<T extends { id: string }>(
  collection: CollectionName,
  newItems: T[]
): T[] {
  const items = readCollection<T>(collection)
  items.push(...newItems)
  writeCollection(collection, items)
  return newItems
}

// --- Query helpers ---

export function findWhere<T extends { id: string }>(
  collection: CollectionName,
  predicate: (item: T) => boolean
): T[] {
  return readCollection<T>(collection).filter(predicate)
}

export function findOneWhere<T extends { id: string }>(
  collection: CollectionName,
  predicate: (item: T) => boolean
): T | undefined {
  return readCollection<T>(collection).find(predicate)
}

// --- Export / Import (for backup) ---

export function exportDatabase(): AppDatabase {
  return {
    users: getAll('users'),
    cakeRequests: getAll('cakeRequests'),
    cakeConcepts: getAll('cakeConcepts'),
    themeCategories: getAll('themeCategories'),
    shareLinks: getAll('shareLinks'),
    comments: getAll('comments'),
    bonanzaSchedules: getAll('bonanzaSchedules'),
  }
}

export function importDatabase(data: Partial<AppDatabase>): void {
  for (const key of COLLECTION_KEYS) {
    if (data[key]) {
      writeCollection(key, data[key] as { id: string }[])
    }
  }
}

export function clearDatabase(): void {
  for (const key of COLLECTION_KEYS) {
    localStorage.removeItem(getStorageKey(key))
  }
}

// --- ID generation ---

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
