import { Stack } from 'expo-router';

import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Image } from 'expo-image';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          backgroundColor: '#fdfbf7',
        }}
      >
        <View 
          style={{ 
            width: 250,         
            height: 250,         
            marginBottom: 20,            
          }}
        >
          <Image
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
            }}
            source={require('@/assets/images/not-found.png')}
            contentFit="contain" // "contain" works better for icons/illustrations than "cover"
            transition={1000}
          />
        </View>
        <Text>This screen does not exist.</Text>
        <Link href='/'>Go to home screen!</Link>
      </View>
    </>
  );
}