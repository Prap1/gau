import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import medicineReducer from './medicineSlice';
import medicineUsageReducer from './medicineUsageSlice';
import treatmentReducer from './treatmentSlice';
import userReducer from './userSlice';
import inventoryReducer from './inventorySlice';
import blogReducer from './blogSlice';
import galleryReducer from './gallerySlice';
import visitorReducer from './visitorSlice';
import donorReducer from './donorSlice';
import symptomReducer from './symptomSlice';
import diseaseReducer from './diseaseSlice';
import medicalStoreReducer from './medicalStoreSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    medicine: medicineReducer,
    medicineUsage: medicineUsageReducer,
    treatment: treatmentReducer,
    users: userReducer,
    inventory: inventoryReducer,
    blog: blogReducer,
    gallery: galleryReducer,
    visitor: visitorReducer,
    donor: donorReducer,
    symptom: symptomReducer,
    disease: diseaseReducer,
    medicalStore: medicalStoreReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
