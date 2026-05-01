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
        apiKey:'asdaw'
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
            console.log("gemini response text",response.candidates?.[0]?.content);

            return response!.candidates?.[0]?.content || '';
        } catch (err) {
            setError('Image to text conversion failed');
        } finally {
            setIsLoading(false);
        }
    }

    const textToSpeech = async (text: string, documentName: string) => {
        setIsLoading(true);
        try {
             if (!text.trim()) {
                throw new Error("Text is empty");
            }
            const response = await genAI.models.generateContent({
                model: "gemini-3.1-flash-tts-preview",
                contents: [{ parts: [{ text: 'Say cheerfully: Have a wonderful day!' }] }],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

           const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (!base64Data) {
                throw new Error("No audio data received from Gemini");
            }

            // 2. Prepare the File Path (Replace spaces in name for safety)
            const file = new File(Paths.document,`${FileSystem.documentDirectory}${documentName.replace(/\s+/g, '_').toLowerCase()}.wav`);
            file.create();
            const safeName = documentName.replace(/\s+/g, '_').toLowerCase();
            const fileUri = `${FileSystem.documentDirectory}${safeName}.wav`;

            // 3. Write directly to Expo FileSystem (No Buffer needed)
            await FileSystem.Paths.(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log("Audiobook saved successfully at:", fileUri);
        } catch (err) {
            setError('Text to speech conversion failed');
        } finally {
            setIsLoading(false);
        }
    };
    return { imageToText,textToSpeech, isLoading, error };

}

export{ useGeminiApi };