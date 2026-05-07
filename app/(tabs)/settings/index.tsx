import { Card } from '@/components/ui/card';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Lock, Trash, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { documentsActions } from '@/store/documents/slice';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const dispatch = useAppDispatch();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>

        <Section label="API">
          <View style={{ padding: 14, gap: 10 }}>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '500' }}>Gemini API key</Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                Used for text-to-speech conversion
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: '#f3f4f6', borderRadius: 8,
                paddingHorizontal: 10, height: 36,
              }}>
                <Lock size={14} color="#9ca3af" />
                <TextInput
                  value={apiKey}
                  onChangeText={setApiKey}
                  secureTextEntry={!showKey}
                  placeholder="sk-..."
                  placeholderTextColor="#9ca3af"
                  style={{ flex: 1, fontSize: 13, color: '#111' }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowKey(p => !p)}
                style={{
                  paddingHorizontal: 12, height: 36, borderRadius: 8,
                  borderWidth: 0.5, borderColor: '#d1d5db',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 12 }}>{showKey ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Section>


        <Section label="Appearance">
          <SettingRow title="Dark mode" description="Toggle theme">
            <ModeToggle />
          </SettingRow>
        </Section>

        <Section label="Storage">
          <TouchableOpacity
            onPress={() => dispatch(documentsActions.clearAll())}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}
          >
            <View>
              <Text style={{ fontSize: 13, fontWeight: '500', color: 'red' }}>Clear all documents</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Remove all uploaded files</Text>
            </View>
            <Trash size={18} color="red" />
          </TouchableOpacity>
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={{ gap: 8 }}>
    <Text style={{ fontSize: 18, fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>
      {label}
    </Text>
    <Card style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      {children}
    </Card>
  </View>
);

const SettingRow = ({
  title, description, children, divider = false
}: {
  title: string; description?: string; children?: React.ReactNode; divider?: boolean;
}) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, gap: 12,
    borderBottomWidth: divider ? 0.5 : 0, borderBottomColor: '#e5e7eb',
  }}>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, fontWeight: '500' }}>{title}</Text>
      {description && <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{description}</Text>}
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {children}
    </View>
  </View>
);