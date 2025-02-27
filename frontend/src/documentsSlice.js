import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch documents action with token expiry handling
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (userId, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:1337/api/documents/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return rejectWithValue('Session expired. Please log in again.');
    }

    const data = await response.json();
    if (response.ok) {
      return data.data;
    } else {
      return rejectWithValue(data.message);
    }
  }
);

// Create document action with token expiry handling
export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async ({ userId, title }, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    
    const userResponse = await fetch('http://localhost:1337/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (userResponse.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return rejectWithValue('Session expired. Please log in again.');
    }

    const userData = await userResponse.json();
    userId = userData.id;
    console.log(userId);

    const response = await fetch('http://localhost:1337/api/documents', {
      method: 'POST',   
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          title,
          content: '',
          author: userId,
        },
      }),
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return rejectWithValue('Session expired. Please log in again.');
    }

    const data = await response.json();
    if (response.ok) {
      return data.data;
    } else {
      return rejectWithValue(data.message);
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default documentsSlice.reducer;
