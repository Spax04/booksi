import { extractText, getPageCount, isAvailable } from 'expo-pdf-text-extract';
import * as DocumentPicker from 'expo-document-picker';
import { useAppDispatch } from '../useAppStore';
import { useState } from 'react';
import { documentsActions } from '../../store/documents/slice';
import { IDocumentObject } from '@/store/documents/types';

const  usePdfParser = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePdfExtraction = async (filePath: string) => {
        try {
            const text = await extractText(filePath);
            const pages = await getPageCount(filePath);
            return { text, pages };
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

    return { pickPdfDocument, handlePdfExtraction, isLoading, error };
}

export { usePdfParser };