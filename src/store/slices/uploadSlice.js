import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  active: false,
  progress: 0,
  stage: '',       // 'video' | 'thumbnail' | 'saving' | 'complete' | 'failed'
  fileName: '',
  error: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    startUpload(state, action) {
      state.active = true;
      state.progress = 0;
      state.stage = 'video';
      state.fileName = action.payload;
      state.error = null;
    },
    setProgress(state, action) {
      state.progress = action.payload;
    },
    setStage(state, action) {
      state.stage = action.payload;
    },
    completeUpload(state) {
      state.active = false;
      state.progress = 100;
      state.stage = 'complete';
      state.error = null;
    },
    failUpload(state, action) {
      state.active = false;
      state.progress = 0;
      state.stage = 'failed';
      state.error = action.payload;
    },
    resetUpload() {
      return initialState;
    },
  },
});

export const {
  startUpload,
  setProgress,
  setStage,
  completeUpload,
  failUpload,
  resetUpload,
} = uploadSlice.actions;

export const selectUploadActive = (state) => state.upload.active;
export const selectUploadProgress = (state) => state.upload.progress;
export const selectUploadStage = (state) => state.upload.stage;
export const selectUploadFileName = (state) => state.upload.fileName;
export const selectUploadError = (state) => state.upload.error;

export default uploadSlice.reducer;
