import { RootState } from "../index";

const getGeminiApiKey = (state: RootState) => state.credentialReducer.GEMINI_API_KEY;

export {
    getGeminiApiKey,
}