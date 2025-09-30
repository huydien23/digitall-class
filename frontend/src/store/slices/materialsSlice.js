import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import materialLibraryService from "../../services/materialLibraryService"

export const fetchMaterials = createAsyncThunk(
  "materials/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await materialLibraryService.list(params)
      const data = res.data
      // Normalize to array regardless of DRF pagination
      const items = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : []
      return items
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

export const createMaterial = createAsyncThunk(
  "materials/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await materialLibraryService.create(formData)
      return res.data
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

export const publishMaterial = createAsyncThunk(
  "materials/publish",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await materialLibraryService.publish(id, payload)
      return { id, published_to: res.data?.published_to || [] }
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

export const uploadVersion = createAsyncThunk(
  "materials/uploadVersion",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await materialLibraryService.uploadVersion(id, formData)
      return { id, version: res.data }
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

export const unpublishMaterial = createAsyncThunk(
  "materials/unpublish",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await materialLibraryService.unpublish(id, payload)
      return {
        id,
        unpublished_from: res.data?.unpublished_from || [],
        remaining_publications: typeof res.data?.remaining_publications === 'number'
          ? res.data.remaining_publications
          : undefined,
      }
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

const initialState = {
  items: [],
  trash: [],
  loading: false,
  error: null,
}

const materialsSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false
        state.items = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        // Prepend new item when items is an array
        state.items = Array.isArray(state.items) ? [action.payload, ...state.items] : [action.payload]
      })
      // Trash flows
      .addCase(fetchTrash.fulfilled, (state, action) => {
        state.trash = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        const id = action.payload?.id
        if (Array.isArray(state.items)) {
          state.items = state.items.filter((m) => m.id !== id)
        }
      })
      .addCase(restoreMaterial.fulfilled, (state, action) => {
        const id = action.payload?.id
        if (Array.isArray(state.trash)) {
          state.trash = state.trash.filter((m) => m.id !== id)
        }
      })
      .addCase(purgeMaterial.fulfilled, (state, action) => {
        const id = action.payload?.id
        if (Array.isArray(state.trash)) {
          state.trash = state.trash.filter((m) => m.id !== id)
        }
      })
      .addCase(publishMaterial.fulfilled, (state, action) => {
        const { id, published_to } = action.payload || {}
        const idx = Array.isArray(state.items) ? state.items.findIndex((m) => m.id === id) : -1
        if (idx > -1 && state.items[idx]) {
          // Mark as published optimistically
          state.items[idx].status = 'published'
          if (Array.isArray(published_to)) {
            const prev = Number(state.items[idx].publications_count || 0)
            // Avoid negative or NaN
            const inc = published_to.length
            const next = isNaN(prev) ? inc : Math.max(prev, prev + inc)
            state.items[idx].publications_count = next
          }
        }
      })
      .addCase(unpublishMaterial.fulfilled, (state, action) => {
        const { id, remaining_publications } = action.payload || {}
        const idx = Array.isArray(state.items) ? state.items.findIndex((m) => m.id === id) : -1
        if (idx > -1 && state.items[idx]) {
          if (typeof remaining_publications === 'number') {
            state.items[idx].publications_count = remaining_publications
            if (remaining_publications === 0) {
              state.items[idx].status = 'draft'
            }
          }
        }
      })
  },
})

// Trash thunks
export const fetchTrash = createAsyncThunk(
  "materials/fetchTrash",
  async (_, { rejectWithValue }) => {
    try {
      const res = await materialLibraryService.listTrash()
      const data = res.data
      const items = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
      return items
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

export const deleteMaterial = createAsyncThunk(
  "materials/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await materialLibraryService.remove(id)
      return { id, message: res.data?.message }
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

export const restoreMaterial = createAsyncThunk(
  "materials/restore",
  async (id, { rejectWithValue }) => {
    try {
      const res = await materialLibraryService.restore(id)
      return { id, message: res.data?.message }
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

export const purgeMaterial = createAsyncThunk(
  "materials/purge",
  async (id, { rejectWithValue }) => {
    try {
      await materialLibraryService.purge(id)
      return { id }
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message)
    }
  }
)

export default materialsSlice.reducer
