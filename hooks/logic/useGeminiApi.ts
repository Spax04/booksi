import { GoogleGenAI, GoogleGenAIOptions } from "@google/genai";
import { useAppDispatch } from "../useAppStore";
import { useState } from "react";
import { File, Directory, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system';
import { documentsActions } from "@/store/documents/slice";
import { useLogicUtils } from "./utils";
const useGeminiApi = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { pcmToWav } = useLogicUtils();

    const options : GoogleGenAIOptions = {
        apiKey:'AIzaSyB30Rw-MzlWeQxGZ6PB8NxMb4rAgH0ZxUo',
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

    const textToSpeech = async (text: string, documentName: string,pageNumber: number) => {
        setIsLoading(true);
        try {
             if (!text.trim()) {
                throw new Error("Text is empty");
            }

            const promptText = `
                Please read the following text as an audiobook narrator.
                Speak slowly, clearly, and in a pleasant manner.
                Use a calm, expressive tone, with natural pauses between sentences.

                Text:
                ${text}
                `;

            console.log("Converting to audio in progress");
            const response = await genAI.models.generateContent({
                model: "gemini-3.1-flash-tts-preview",
                contents: [{ parts: [{ text: promptText }] }],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            console.log('full audio respone', response);
            const data : any = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            //console.log("response audio:" , response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data);

            const fileUri = `${documentName}_page${pageNumber}.wav`;            

            const file  = new File(Paths.document,fileUri);

            const convertedWavBase64 = pcmToWav(data);
            console.log("convertedWavBase64", convertedWavBase64);
            file.write(convertedWavBase64,{encoding: 'base64'});
            //console.log("Audio with url saved: ",);
           return file.uri;
            
            //console.log("Audiobook saved successfully at:", fileUri);
        } catch (err) {
            setError('Text to speech conversion failed');
        } finally {
            setIsLoading(false);
        }
    };
    return { imageToText,textToSpeech, isLoading, error };

}

export{ useGeminiApi };

