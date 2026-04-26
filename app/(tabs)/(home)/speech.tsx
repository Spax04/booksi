import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import {View } from '@/components/ui/view';
import { useLocalSearchParams } from 'expo-router';
import { usePdfParser } from '@/hooks/logic/usePdfParser';
import { useAppSelector } from '@/hooks/useAppStore';
import { getDocumentByName } from '@/store/documents/selectors';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play ,Pause} from 'lucide-react-native';
import { convert, convertB64 } from 'react-native-pdf-to-image';
import { Alert, NativeModules } from 'react-native';
import { ExportManager } from 'react-native-pdf-jsi/src/managers/ExportManager';
import React from 'react';
import { GoogleGenAI ,GoogleGenAIOptions} from "@google/genai";
import { useGeminiApi } from '@/hooks/logic/useGeminiApi';
import * as FileSystem from 'expo-file-system';
import { IPageDocument } from '@/store/documents/types';

const PdfModule = require('react-native-pdf-jsi');
const Pdf = PdfModule.default;

const { FileDownloader, FileManager } = NativeModules;


export default function SpeechScreen() {
      const { index } = useLocalSearchParams<{ index: string }>();
  const { extractTextFromPdf, isLoading, error} = usePdfParser();
  const document = useAppSelector(state => getDocumentByName(state, index));
  const [isPlaying, setIsPlaying] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pagesData, setPagesData] = useState<IPageDocument[]>([]);
  const [urlImage, setUrlImage] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
 const { imageToText } = useGeminiApi();

  const pdfRef = React.useRef(null);
  const exportManager = new ExportManager();

 const handleExport = async () => {
  
   
  };


  useEffect(() => {
    if (document) {
      setPagesData(document.pagesDocument);
    }
  }, [document]);

  useEffect(() => {

    const extractContent = async () => {
      if (document) {

        const cleanPath = document.uri.replace('file://', '');
        setUrlImage(cleanPath);

        await extractTextFromPdf(cleanPath, document.name);
      }
    };
    
    extractContent();
  }, [index]);

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
    
  };

  return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        
          <Text variant='subtitle' style={{ color: 'darkColor' }}>
      {isLoading ? 'Extracting PDF...' : error ? `Error: ${error}` : document ? `Document: ${document.name}` : 'No document found'}
    </Text>

    <View style={{ flexDirection: 'row', gap: 16, marginTop: 24 }}>
      <Button onPress={handleExport} icon={isPlaying ? Pause : Play}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
    </View>
      </SafeAreaView>
  );
}