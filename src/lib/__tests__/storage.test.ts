/// <reference types="vitest/globals" />

// --- localStorage polyfill for test environment ---
// Vitest's jsdom may not always provide a fully functional localStorage.

const store: Record<string, string> = {}
const localStorageMock: Storage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = String(value)
  },
  removeItem: (key: string) => {
    delete store[key]
  },
  clear: () => {
    for (const key of Object.keys(store)) {
      delete store[key]
    }
  },
  get length() {
    return Object.keys(store).length
  },
  key: (index: number) => Object.keys(store)[index] ?? null,
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

import {
  getAll,
  getById,
  create,
  update,
  remove,
  createMany,
  findWhere,
  findOneWhere,
  exportDatabase,
  importDatabase,
  clearDatabase,
  generateId,
} from '../storage'

// --- Helpers ---

interface TestItem {
  id: string
  name: string
  value?: number
}

const COLLECTION = 'users' as const

beforeEach(() => {
  localStorageMock.clear()
})

// =============================================================================
// generateId
// =============================================================================

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('returns unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

// =============================================================================
// getAll / create
// =============================================================================

describe('getAll', () => {
  it('returns empty array when collection is empty', () => {
    expect(getAll(COLLECTION)).toEqual([])
  })

  it('returns all items after creating them', () => {
    const a: TestItem = { id: '1', name: 'Alice' }
    const b: TestItem = { id: '2', name: 'Bob' }
    create<TestItem>(COLLECTION, a)
    create<TestItem>(COLLECTION, b)
    expect(getAll<TestItem>(COLLECTION)).toEqual([a, b])
  })
})

describe('create', () => {
  it('returns the created item', () => {
    const item: TestItem = { id: '1', name: 'Alice' }
    const result = create<TestItem>(COLLECTION, item)
    expect(result).toEqual(item)
  })

  it('persists to localStorage', () => {
    create<TestItem>(COLLECTION, { id: '1', name: 'Alice' })
    const raw = localStorageMock.getItem('cakegen:users')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual([{ id: '1', name: 'Alice' }])
  })
})

// =============================================================================
// getById
// =============================================================================

describe('getById', () => {
  it('returns undefined when item does not exist', () => {
    expect(getById(COLLECTION, 'nonexistent')).toBeUndefined()
  })

  it('returns the correct item', () => {
    create<TestItem>(COLLECTION, { id: '1', name: 'Alice' })
    create<TestItem>(COLLECTION, { id: '2', name: 'Bob' })
    expect(getById<TestItem>(COLLECTION, '2')).toEqual({
      id: '2',
      name: 'Bob',
    })
  })
})

// =============================================================================
// update
// =============================================================================

describe('update', () => {
  it('returns undefined when item does not exist', () => {
    expect(
      update<TestItem>(COLLECTION, 'nonexistent', { name: 'X' })
    ).toBeUndefined()
  })

  it('updates fields and returns the updated item', () => {
    create<TestItem>(COLLECTION, { id: '1', name: 'Alice', value: 10 })
    const result = update<TestItem>(COLLECTION, '1', { value: 42 })
    expect(result).toEqual({ id: '1', name: 'Alice', value: 42 })
  })

  it('persists updates to localStorage', () => {
    create<TestItem>(COLLECTION, { id: '1', name: 'Alice' })
    update<TestItem>(COLLECTION, '1', { name: 'Updated' })
    expect(getById<TestItem>(COLLECTION, '1')?.name).toBe('Updated')
  })
})

// =============================================================================
// remove
// =============================================================================

describe('remove', () => {
  it('returns false when item does not exist', () => {
    expect(remove(COLLECTION, 'nonexistent')).toBe(false)
  })

  it('removes the item and returns true', () => {
    create<TestItem>(COLLECTION, { id: '1', name: 'Alice' })
    create<TestItem>(COLLECTION, { id: '2', name: 'Bob' })
    expect(remove(COLLECTION, '1')).toBe(true)
    expect(getAll<TestItem>(COLLECTION)).toEqual([{ id: '2', name: 'Bob' }])
  })
})

// =============================================================================
// createMany
// =============================================================================

describe('createMany', () => {
  it('adds multiple items at once', () => {
    const items: TestItem[] = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '3', name: 'C' },
    ]
    const result = createMany<TestItem>(COLLECTION, items)
    expect(result).toEqual(items)
    expect(getAll<TestItem>(COLLECTION)).toHaveLength(3)
  })

  it('appends to existing items', () => {
    create<TestItem>(COLLECTION, { id: '0', name: 'Existing' })
    createMany<TestItem>(COLLECTION, [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ])
    expect(getAll<TestItem>(COLLECTION)).toHaveLength(3)
  })
})

// =============================================================================
// findWhere / findOneWhere
// =============================================================================

describe('findWhere', () => {
  it('returns matching items', () => {
    createMany<TestItem>(COLLECTION, [
      { id: '1', name: 'Alice', value: 10 },
      { id: '2', name: 'Bob', value: 20 },
      { id: '3', name: 'Charlie', value: 10 },
    ])
    const result = findWhere<TestItem>(COLLECTION, (i) => i.value === 10)
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie'])
  })

  it('returns empty array when nothing matches', () => {
    create<TestItem>(COLLECTION, { id: '1', name: 'Alice' })
    expect(findWhere<TestItem>(COLLECTION, (i) => i.name === 'Nobody')).toEqual(
      []
    )
  })
})

describe('findOneWhere', () => {
  it('returns first matching item', () => {
    createMany<TestItem>(COLLECTION, [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ])
    const result = findOneWhere<TestItem>(COLLECTION, (i) => i.name === 'Bob')
    expect(result).toEqual({ id: '2', name: 'Bob' })
  })

  it('returns undefined when nothing matches', () => {
    expect(
      findOneWhere<TestItem>(COLLECTION, (i) => i.name === 'Nobody')
    ).toBeUndefined()
  })
})

// =============================================================================
// exportDatabase / importDatabase / clearDatabase
// =============================================================================

describe('exportDatabase', () => {
  it('exports all collections', () => {
    create<TestItem>(COLLECTION, { id: '1', name: 'Alice' })
    const db = exportDatabase()
    expect(db.users).toEqual([{ id: '1', name: 'Alice' }])
    expect(db.cakeRequests).toEqual([])
    expect(db.cakeConcepts).toEqual([])
    expect(db.themeCategories).toEqual([])
    expect(db.shareLinks).toEqual([])
    expect(db.comments).toEqual([])
    expect(db.bonanzaSchedules).toEqual([])
  })
})

describe('importDatabase', () => {
  it('imports data into collections', () => {
    importDatabase({
      users: [{ id: '1', displayName: 'Alice', createdAt: '2026-01-01' }],
    })
    expect(getAll(COLLECTION)).toHaveLength(1)
  })

  it('overwrites existing data in imported collections', () => {
    create<TestItem>(COLLECTION, { id: 'old', name: 'Old' })
    importDatabase({
      users: [{ id: 'new', displayName: 'New', createdAt: '2026-01-01' }],
    })
    const all = getAll<TestItem>(COLLECTION)
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe('new')
  })
})

describe('clearDatabase', () => {
  it('removes all collections from localStorage', () => {
    create<TestItem>(COLLECTION, { id: '1', name: 'Alice' })
    create<TestItem>('cakeRequests', { id: '2', name: 'Req' })
    clearDatabase()
    expect(getAll(COLLECTION)).toEqual([])
    expect(getAll('cakeRequests')).toEqual([])
  })
})

// =============================================================================
// Edge cases
// =============================================================================

describe('edge cases', () => {
  it('handles corrupted localStorage data gracefully', () => {
    localStorageMock.setItem('cakegen:users', 'not-valid-json')
    // Should not throw, returns empty array
    expect(getAll(COLLECTION)).toEqual([])
  })
})
