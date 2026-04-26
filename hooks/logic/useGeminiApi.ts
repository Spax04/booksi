import { GoogleGenAI, GoogleGenAIOptions } from "@google/genai";
import { useAppDispatch } from "../useAppStore";
import { useState } from "react";
import { File, Directory, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system';
const useGeminiApi = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const options : GoogleGenAIOptions = {
        apiKey:''
    }
    const genAI = new GoogleGenAI(options);

    const imageToText = async (imageUri: string) => {
        setIsLoading(true);
        try {
            const file = new File('file://'+imageUri);
            if (!file.exists) {
                throw new Error("File does not exist at path: " + imageUri);
            }
            const base64Data = await file.base64();
            const contents = [
            {
                inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
                },
            },
            { text: "Convert this image to text." },
            ];

            const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: contents,
            });
            console.log("gemini response",response.candidates?.[0]?.content);

            return response!.candidates?.[0]?.content || '';
        } catch (err) {
            setError('Image to text conversion failed');
        } finally {
            setIsLoading(false);
        }
    }

    return { imageToText, isLoading, error };

}

export{ useGeminiApi };