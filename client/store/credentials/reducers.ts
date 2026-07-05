import { PayloadAction } from "@reduxjs/toolkit";
import { IRootState } from "./types";

const reducers = {
    setGeminiApiKey: (state :IRootState, action: PayloadAction<IRootState['GEMINI_API_KEY']>) => {
        return {
            ...state,
            GEMINI_API_KEY: action.payload,
        }
    }
}

export {
    reducers,
};