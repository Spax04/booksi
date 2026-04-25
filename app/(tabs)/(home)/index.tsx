import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { Icon } from '@/components/ui/icon';
import {CloudCog, Upload, Trash} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { clampRGBA } from 'react-native-reanimated/lib/typescript/Colors';
import { File, Directory, Paths } from 'expo-file-system';
import { extractText, getPageCount, isAvailable } from 'expo-pdf-text-extract';
import { ScrollView } from '@/components/ui/scroll-view';
import { useEffect } from 'react';
import { usePdfParser } from '@/hooks/logic/usePdfParser';
import { useAppSelector } from '@/hooks/useAppStore';
import { getDocumentList } from '@/store/documents/selectors';
import { BORDER_RADIUS } from '@/theme/globals';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { documentsActions } from '@/store/documents/slice';
import { router } from 'expo-router';
import { Pressable } from 'react-native';


export default function HomeScreen() {
  const {pickPdfDocument, isLoading, error} = usePdfParser();
  const uploadedDocuments = useAppSelector(getDocumentList);
  const dispatch = useDispatch();

useEffect(() => {
    console.log([...uploadedDocuments]);
  }, [uploadedDocuments]);

  const removeDocument = (doc: typeof uploadedDocuments[number]) => {
    dispatch(documentsActions.removeSelectedDocumnetObject(doc));
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>

   <View style={{ flex: 1, padding: 24 }}>

   <View
      style={{
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: BORDER_RADIUS,
        flex: 8,
      }}
    >
  <ScrollView
      contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={true}
  >
    {Array.isArray(uploadedDocuments) && uploadedDocuments.length > 0 ? (
      uploadedDocuments.map((doc, index) => (
        <Pressable key={index} onPress={() => router.push({ pathname: '/speech', params: { index: doc.name } })}>
          <Card  style={{ marginBottom: 12 ,flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{ fontWeight: 'bold', color: '#000', flex: 10 }}>{doc.name}</Text>
            <Button
              icon={Trash}
              style={{ backgroundColor: 'red', flex:2, maxWidth: 80 }}
              textStyle={{ color: 'white', fontWeight: 'bold' }}
              onPress={() => removeDocument(doc)}
            />
          </Card>
        </Pressable>

      ))
    ) : (
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <CloudCog size={48} color='#888' />
        <Text style={{ marginTop: 12, color: '#888' }}>
          No documents uploaded yet.
        </Text>
      </View>
    )}
  </ScrollView>
</View>
  <View style={{
        marginTop: 24,
        flex: 2,
      }}>
    <LinearGradient
      colors={['#00B4DB', '#0083B0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 12, overflow: 'hidden' }}
    >
      <Button
        icon={Upload}
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: 'white', fontWeight: 'bold' }}
        onPress={pickPdfDocument}
      >
        Upload PDF
      </Button>
    </LinearGradient>
  </View>

</View>
</SafeAreaView>
  );
}
