import { configureStore, combineReducers } from '@reduxjs/toolkit';
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

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('app_state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state: any) => {
  try {
    const stateToSave = {
      visitor: state.visitor,
      donor: state.donor,
      medicine: state.medicine,
      treatment: state.treatment,
      users: state.users,
      inventory: state.inventory,
      blog: state.blog,
      gallery: state.gallery,
      symptom: state.symptom,
      disease: state.disease,
      medicalStore: state.medicalStore,
      medicineUsage: state.medicineUsage,
    };
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem('app_state', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

const preloadedState = loadState();

const rootReducer = combineReducers({
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
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

let timeoutId: any;
store.subscribe(() => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    saveState(store.getState());
  }, 1000);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
