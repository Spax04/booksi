import { extractText, getPageCount, isAvailable } from 'expo-pdf-text-extract';
import * as DocumentPicker from 'expo-document-picker';
import { useAppDispatch } from '../useAppStore';
import { useState } from 'react';
import { documentsActions } from '../../store/documents/slice';
import { IDocumentObject } from '@/store/documents/types';
import { ExportManager } from 'react-native-pdf-jsi/src/managers/ExportManager';
import { useGeminiApi } from './useGeminiApi';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Toast } from 'toastify-react-native'

const  usePdfParser = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const exportManager = new ExportManager();
    const { imageToText,textToSpeech } = useGeminiApi();
    const [conversionProgress, setConversionProgress] = useState(0);

   

    const convertPdfToAudio = async (filePath: string, documentName: string) => {
        setIsLoading(true);

        try {
            //const pages = await getPageCount(filePath);
            console.log("Converting PDF to audio...");
            const pages = 3; //! for testing
        const cleanPath = filePath.replace('file://', '');

            for (let i = 1; i <= pages; i++) {  //! for testing, only converting 2 pages

                console.log("Converting image to text number: ",i);
                const imagePath = await exportManager.exportPageToImage(
                    cleanPath,
                    i,
                    { format:'png', quality: 100, scale: 2.0 }
                );
                
                const text : any = await imageToText(imagePath);
                const pageText = text!.parts[0]!.text || '';
                dispatch(documentsActions.setPageDataToDocumentObject({
                    name: documentName,
                    pageNumber: i-1,
                    text: pageText,
                    imageUri: imagePath
                }));

                console.log("STARTIN GOCNVERTION TEXT TO AUDIO");
                const audioUri = await textToSpeech(pageText, documentName, i);

                console.log("audioUri", audioUri);
                if(audioUri) {
                    dispatch(documentsActions.setAudioUriToPageDocument({
                        name: documentName,
                        pageNumber: i-1,
                        audioUri
                    }));
                }

                if(i === pages) {
                    dispatch(documentsActions.setCovertedStatus({
                       isConverted: true,
                       name: documentName
                    }));
                }

                setConversionProgress(((i ) / pages) * 100);
            } 

        } catch (err) {
            setError('Extraction failed');
            console.error(err);
            Toast.error('Conversion failed. Please try again.');
            return null;
        }finally {
            setIsLoading(false);
            setConversionProgress(0);
        }
    };

    const pickPdfDocument = async () => {
        setIsLoading(true);
        const doc = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });


        if (doc?.assets && doc.assets.length > 0) {
            const pagesCount = await getPageCount(doc.assets[0].uri.replace('file://', ''));

            const newDocumentObject: IDocumentObject = {
                uri: doc.assets[0].uri,
                name: doc.assets[0].name,
                size: doc.assets[0].size as number,
                mimeType: doc.assets[0].mimeType as string,
                lastModified: doc.assets[0].lastModified,
                pagesDocument: [],
                pageCount: pagesCount,
                isConverted: false
            };
            
            dispatch(documentsActions.setNewDocumnetObject(newDocumentObject));
        }
        setIsLoading(false);
    };

    return { pickPdfDocument, convertPdfToAudio, isLoading, error ,conversionProgress};
}

export { usePdfParser };