import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Icon } from '@/components/ui/icon';
import { Upload, Trash, BookDown,LibraryBig,FileText, Play  } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from '@/components/ui/scroll-view';
import { useEffect } from 'react';
import { usePdfParser } from '@/hooks/logic/usePdfParser';
import { useAppSelector } from '@/hooks/useAppStore';
import { getDocumentList } from '@/store/documents/selectors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { documentsActions } from '@/store/documents/slice';
import { router } from 'expo-router';
import { Alert, Pressable } from 'react-native';
import { Progress } from '@/components/ui/progress';
import { IDocumentObject } from '@/store/documents/types';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { createWorkletRuntime, runOnRuntime } from 'react-native-worklets';

export default function HomeScreen() {
  const {pickPdfDocument, convertPdfToAudio, isLoading, error,conversionProgress} = usePdfParser();
  const uploadedDocuments = useAppSelector(getDocumentList);
  const dispatch = useDispatch();
  const backgroundRuntime = createWorkletRuntime({ name: 'background' });


useEffect(() => {
    console.log([...uploadedDocuments]);
  }, [uploadedDocuments]);

  useEffect(() => {
   
  }, [conversionProgress]);

  const removeDocument = (doc: typeof uploadedDocuments[number]) => {
    dispatch(documentsActions.removeSelectedDocumnetObject(doc));
  }

  const startConversion = async (doc: IDocumentObject) => {
  
        await convertPdfToAudio(doc.uri, doc.name);
    
  }

const test = async () => {

    console.log([...uploadedDocuments]);
}

  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
            contentContainerStyle={{ padding: 16, gap: 12}}
              showsVerticalScrollIndicator={true}
        >
      <View style={{ flex: 1, padding: 24,  }}>
        <View style={{flex: 8,}}>
            <View style={{
              marginTop: 24,
              flex: 1,
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
            <View style={{ marginTop: 24, flex: 1 }}>
              <Text variant='subtitle' style={{ marginBottom: 22 }}>
                Uploaded (Not converted)
              </Text>
              {Array.isArray(uploadedDocuments) && uploadedDocuments.length > 0 && uploadedDocuments.some((doc) => !doc.isConverted) ? (
                uploadedDocuments.filter((doc) => !doc.isConverted).map((doc, index) => (
                    <Card key={index} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name={FileText} size={24}/>
                        <Text style={{ fontWeight: 'bold', color: '#000', flex: 10 }}>{doc.name}</Text>

                        <Button
                          icon={Trash}
                          style={{ backgroundColor: 'red', flex:2, maxWidth: 80 }}
                          textStyle={{ color: 'white', fontWeight: 'bold' }}
                          onPress={() => removeDocument(doc)}
                        />
                      </View>
                      {/*"Progreess bar"*/}
                      
                      <View style={{ gap: 8, marginTop: 12 }}>
                        {!isLoading ? (<Button
                          icon={Play} // Use a relevant "process" or "play" icon
                          style={{ backgroundColor: '#343a40', borderRadius: 20, paddingHorizontal: 15 }}
                          textStyle={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}
                          onPress={() => startConversion(doc)}
                        > Convert</Button>) :(
                           <><View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Text variant='caption' style={{ fontWeight: '600' }}>
                              Converting document to audio
                            </Text>
                            <Text variant='body' style={{ fontWeight: '500' }}>
                              {Math.round(conversionProgress)}%
                            </Text>
                          </View><Progress value={conversionProgress} height={10} /></>)
                        }
                        
                       
                      </View>
                    </Card>
                ))
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <BookDown size={48} color='#888' />
                  <Text style={{ marginTop: 12, color: '#888' }}>
                    No documents uploaded yet.
                  </Text>
                </View>
              )}

              {/* Separator */}
              <View
                style={{
                  height: 1,
                  backgroundColor: '#ccc',
                  marginVertical: 10,
                }}
              />

            <Text variant='subtitle' style={{ marginBottom: 22 }}>Ready to play</Text>
              {Array.isArray(uploadedDocuments) && uploadedDocuments.length > 0 && uploadedDocuments.some((doc) => doc.isConverted) ? (
                uploadedDocuments.filter((doc) => doc.isConverted).map((doc, index) => (
                    <Card key={index} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name={FileText} size={24}/>
                        <Text style={{ fontWeight: 'bold', color: '#000', flex: 10 }}>{doc.name}</Text>

                        <Button
                          icon={Trash}
                          style={{ backgroundColor: 'red', flex:2, maxWidth: 80 }}
                          textStyle={{ color: 'white', fontWeight: 'bold' }}
                          onPress={() => removeDocument(doc)}
                        />
                      </View>                      
                      <View style={{ gap: 8, marginTop: 12 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text variant='caption' style={{ fontWeight: '600' }}>
                            Page count: {doc.pageCount}
                          </Text>
                        </View>
                        <Button
                          icon={Play} // Use a relevant "process" or "play" icon
                          style={{ backgroundColor: '#343a40', borderRadius: 20, paddingHorizontal: 15 }}
                          textStyle={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}
                          onPress={() => router.push({ pathname: '/speech', params: { index: doc.name } })}
                        > Play</Button>
                        
                      </View>
                    </Card>
                ))
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <LibraryBig size={48} color='#888' />
                  <Text style={{ marginTop: 12, color: '#888' }}>
                    No documents ready to play. Please upload and convert a PDF.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
