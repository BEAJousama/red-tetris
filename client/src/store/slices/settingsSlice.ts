import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { readSoundEnabled, writeSoundEnabled } from "../../utils/soundPreference";

interface SettingsState {
  soundEnabled: boolean;
}

const initialState: SettingsState = {
  soundEnabled: readSoundEnabled(),
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
      writeSoundEnabled(action.payload);
    },
    toggleSoundEnabled: (state) => {
      state.soundEnabled = !state.soundEnabled;
      writeSoundEnabled(state.soundEnabled);
    },
  },
});

export const { setSoundEnabled, toggleSoundEnabled } = settingsSlice.actions;
export default settingsSlice.reducer;
