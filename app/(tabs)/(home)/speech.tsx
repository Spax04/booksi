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

const PdfModule = require('react-native-pdf-jsi');
const Pdf = PdfModule.default;

const { FileDownloader, FileManager } = NativeModules;


export default function SpeechScreen() {
      const { index } = useLocalSearchParams<{ index: string }>();
  const {handlePdfExtraction, isLoading, error} = usePdfParser();
  const document = useAppSelector(state => getDocumentByName(state, index));
  const [isPlaying, setIsPlaying] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [urlImage, setUrlImage] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);


  const pdfRef = React.useRef(null);
  const exportManager = new ExportManager();

 const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);

    try {
      let exportedFiles = [];

     
      const imagePath = await exportManager.exportPageToImage(
        urlImage,
        currentPage,
        { format:'png', quality: 100, scale: 2.0 }
      );
      exportedFiles = [imagePath];
      setExportProgress(100);

     

      // Download to public storage (Android)
      if (FileDownloader) {
        for (let i = 0; i < exportedFiles.length; i++) {
          await FileDownloader.downloadToPublicFolder(
            exportedFiles[i],
            `page-${i + 1}.png`,
            `image/png`
          );
        }
      }
         setExporting(false);
      setShowExportMenu(false);

      // Show success
      Alert.alert(
        'Export Complete',
        `Exported ${exportedFiles.length} page(s) as PNG`,
        [
          { text: 'Done', style: 'cancel' },
          FileManager && {
            text: 'Open Folder',
            onPress: () => FileManager.openDownloadsFolder()
          },
          {
            text: 'Share',
            onPress: () => exportManager.share(exportedFiles[0], { type: 'file' })
          }
        ].filter(Boolean)
      );

    } catch (error) {
      setExporting(false);
      Alert.alert('Export Failed');
    }
  };

  useEffect(() => {
    console.log('Received index:', index);
    console.log(document);
   
    const extractContent = async () => {
      if (document) {

        const cleanPath = document.uri.replace('file://', '');
        setUrlImage(cleanPath);
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