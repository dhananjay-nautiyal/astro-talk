import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeConsultation: null,
  status: 'idle',
  history: [],
  messages: [],
  loading: false,
  error: null,
}

const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {
    setActiveConsultation: (state, action) => {
      state.activeConsultation = action.payload
      state.status = 'active'
    },
    updateConsultationStatus: (state, action) => {
      state.status = action.payload
      if (action.payload === 'ended') {
        state.activeConsultation = null
      }
    },
    addMessage: (state, action) => {
      // Single source of truth: every message (history load, own send, and
      // incoming socket frames) lands in the top-level messages array so the
      // consultation UI renders the other party's replies.
      state.messages = [...(state.messages || []), action.payload]
    },
    setMessages: (state, action) => {
      state.messages = action.payload || []
    },
    setHistory: (state, action) => {
      state.history = action.payload
    },
    addToHistory: (state, action) => {
      state.history.unshift(action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearActiveConsultation: (state) => {
      state.activeConsultation = null
      state.status = 'idle'
      state.messages = []
    },
  },
})

export const {
  setActiveConsultation,
  updateConsultationStatus,
  addMessage,
  setMessages,
  setHistory,
  addToHistory,
  setLoading,
  setError,
  clearActiveConsultation,
} = consultationSlice.actions
export default consultationSlice.reducer
