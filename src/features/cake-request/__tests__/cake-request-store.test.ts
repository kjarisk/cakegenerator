/// <reference types="vitest/globals" />

import { useCakeRequestStore } from '../state/cake-request-store'

// Reset store between tests
beforeEach(() => {
  useCakeRequestStore.setState({
    isGenerating: false,
    generationProgress: '',
    activeConceptId: null,
    lastCreatedRequestId: null,
  })
})

describe('useCakeRequestStore', () => {
  // --- Generation tracking ---

  describe('generation tracking', () => {
    it('starts with isGenerating false and empty progress', () => {
      const state = useCakeRequestStore.getState()
      expect(state.isGenerating).toBe(false)
      expect(state.generationProgress).toBe('')
    })

    it('setGenerating updates isGenerating and progress', () => {
      useCakeRequestStore
        .getState()
        .setGenerating(true, 'Generating recipes...')
      const state = useCakeRequestStore.getState()
      expect(state.isGenerating).toBe(true)
      expect(state.generationProgress).toBe('Generating recipes...')
    })

    it('setGenerating with no progress defaults to empty string', () => {
      useCakeRequestStore.getState().setGenerating(true)
      expect(useCakeRequestStore.getState().generationProgress).toBe('')
    })

    it('setGenerating can turn off generating', () => {
      useCakeRequestStore.getState().setGenerating(true, 'Working...')
      useCakeRequestStore.getState().setGenerating(false)
      const state = useCakeRequestStore.getState()
      expect(state.isGenerating).toBe(false)
      expect(state.generationProgress).toBe('')
    })
  })

  // --- Active concept ---

  describe('active concept', () => {
    it('starts with null activeConceptId', () => {
      expect(useCakeRequestStore.getState().activeConceptId).toBeNull()
    })

    it('setActiveConceptId sets the id', () => {
      useCakeRequestStore.getState().setActiveConceptId('concept-123')
      expect(useCakeRequestStore.getState().activeConceptId).toBe('concept-123')
    })

    it('setActiveConceptId can clear back to null', () => {
      useCakeRequestStore.getState().setActiveConceptId('concept-123')
      useCakeRequestStore.getState().setActiveConceptId(null)
      expect(useCakeRequestStore.getState().activeConceptId).toBeNull()
    })
  })

  // --- Last created request ---

  describe('last created request', () => {
    it('starts with null lastCreatedRequestId', () => {
      expect(useCakeRequestStore.getState().lastCreatedRequestId).toBeNull()
    })

    it('setLastCreatedRequestId sets the id', () => {
      useCakeRequestStore.getState().setLastCreatedRequestId('req-456')
      expect(useCakeRequestStore.getState().lastCreatedRequestId).toBe(
        'req-456'
      )
    })

    it('setLastCreatedRequestId can clear back to null', () => {
      useCakeRequestStore.getState().setLastCreatedRequestId('req-456')
      useCakeRequestStore.getState().setLastCreatedRequestId(null)
      expect(useCakeRequestStore.getState().lastCreatedRequestId).toBeNull()
    })
  })
})
