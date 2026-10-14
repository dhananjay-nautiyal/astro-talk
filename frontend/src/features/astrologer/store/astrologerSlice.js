import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  list: [],
  selected: null,
  filters: {
    specialization: '',
    language: '',
    minPrice: 0,
    maxPrice: 1000,
    rating: 0,
    onlineOnly: false,
    search: '',
  },
  pagination: {
    page: 1,
    totalPages: 1,
    totalElements: 0,
  },
  loading: true,
  error: null,
}

const astrologerSlice = createSlice({
  name: 'astrologer',
  initialState,
  reducers: {
    setAstrologers: (state, action) => {
      state.list = action.payload.content || action.payload
      state.pagination = {
        page: action.payload.pageable?.pageNumber + 1 || 1,
        totalPages: action.payload.totalPages || 1,
        totalElements: action.payload.totalElements || action.payload.length || 0,
      }
    },
    setSelectedAstrologer: (state, action) => {
      state.selected = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const {
  setAstrologers,
  setSelectedAstrologer,
  setFilters,
  resetFilters,
  setPage,
  setLoading,
  setError,
} = astrologerSlice.actions
export default astrologerSlice.reducer
