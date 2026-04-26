import { extractText, getPageCount, isAvailable } from 'expo-pdf-text-extract';
import * as DocumentPicker from 'expo-document-picker';
import { useAppDispatch } from '../useAppStore';
import { useState } from 'react';
import { documentsActions } from '../../store/documents/slice';
import { IDocumentObject } from '@/store/documents/types';
import { ExportManager } from 'react-native-pdf-jsi/src/managers/ExportManager';
import { useGeminiApi } from './useGeminiApi';


// {
//   "candidates": [
//     {
//       "citationMetadata": [Object],
//       "content": [Object],
//       "finishReason": "STOP",
//       "index": 0
//     }
//   ],
//   "modelVersion": "gemini-3-flash-preview",
//   "responseId": "alHuaf3PEo6N7M8P_o_emQE",
//   "sdkHttpResponse": {
//     "headers": {
//       "alt-svc": "h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000",
//       "content-type": "application/json; charset=UTF-8",
//       "date": "Sun, 26 Apr 2026 17:54:50 GMT",
//       "server": "scaffolding on HTTPServer2",
//       "server-timing": "gfet4t7; dur=12058",
//       "vary": "Origin, X-Origin, Referer",
//       "x-content-type-options": "nosniff",
//       "x-frame-options": "SAMEORIGIN",
//       "x-gemini-service-tier": "standard",
//       "x-xss-protection": "0"
//     }
//   },
//   "usageMetadata": {
//     "candidatesTokenCount": 454,
//     "promptTokenCount": 1073,
//     "promptTokensDetails": [
//       [Object],
//       [Object]
//     ],
//     "thoughtsTokenCount": 1169,
//     "totalTokenCount": 2696
//   }
const  usePdfParser = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const exportManager = new ExportManager();
    const { imageToText } = useGeminiApi();

    const extractTextFromPdf = async (filePath: string, documentName: string) => {
        setIsLoading(true);

        try {
            const pages = await getPageCount(filePath);

            for (let i = 1; i <= pages/2; i++) {

                const imagePath = await exportManager.exportPageToImage(
                    filePath,
                    i,
                    { format:'png', quality: 100, scale: 2.0 }
                );
                
                const text = await imageToText(imagePath);
                // dispatch(documentsActions.setPageDataToDocumentObject({
                //     name: documentName,
                //     text: text || '',
                //     imageUri: imagePath
                // }));
             }

            
            
        } catch (err) {
            setError('Extraction failed');
            return null;
        }
    };

    const pickPdfDocument = async () => {
        setIsLoading(true);
        const doc = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });

        if (doc?.assets && doc.assets.length > 0) {
            dispatch(documentsActions.setNewDocumnetObject(doc.assets[0] as IDocumentObject));
        }
        setIsLoading(false);
    };

    return { pickPdfDocument,extractTextFromPdf, isLoading, error };
}

export { usePdfParser };