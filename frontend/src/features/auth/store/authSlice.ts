import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  role: string | null
  loading: boolean
  error: string | null
}

const STORAGE_KEY = 'token'
const USER_KEY = 'authUser'
const ROLE_KEY = 'authRole'

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

const storedToken = localStorage.getItem(STORAGE_KEY)
const storedUser = loadStoredUser()
const storedRole = localStorage.getItem(ROLE_KEY)

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  role: storedRole,
  loading: false,
  error: null,
}

interface LoginPayload {
  id: string
  name: string
  email: string
  role: string
  token: string
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = {
        id: action.payload.id,
        name: action.payload.name,
        email: action.payload.email,
        role: action.payload.role,
      }
      state.token = action.payload.token
      state.role = action.payload.role
      localStorage.setItem(STORAGE_KEY, action.payload.token)
      localStorage.setItem(USER_KEY, JSON.stringify(state.user))
      localStorage.setItem(ROLE_KEY, action.payload.role)
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.role = null
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(ROLE_KEY)
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      state.user = state.user ? { ...state.user, ...action.payload } : null
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } = authSlice.actions
export default authSlice.reducer
