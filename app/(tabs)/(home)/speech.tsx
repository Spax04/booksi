import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import {View } from '@/components/ui/view';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/hooks/useAppStore';
import { getDocumentByName } from '@/store/documents/selectors';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play ,Pause, SkipBack, SkipForward} from 'lucide-react-native';
import React from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { File, Directory, Paths } from 'expo-file-system';
import { Pressable, ScrollView,StyleSheet } from 'react-native';

const SPEEDS = [1, 1.5, 2, 0.75];

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SpeechScreen() {
      const { index } = useLocalSearchParams<{ index: string }>();
  const document = useAppSelector(state => getDocumentByName(state, index));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const pages = document?.pagesDocument ?? [];

// Pass null if it doesn't exist yet, so the player waits.
const player = useAudioPlayer(null);
const status = useAudioPlayerStatus(player);


  useEffect(() => {
    if (document) {
      console.log(document);
    }
  }, [document]);

useEffect(() => {
    player.setPlaybackRate(SPEEDS[speedIdx]);
  }, [speedIdx]);
  
const handleSelectPage = useCallback((pageIndex: number) => {
  console.log(pageIndex);
    if (selectedPage !== null) player.pause();
      const audioUri = document?.pagesDocument?.[pageIndex]?.audioUri;
      player.replace({ uri: audioUri });
      setSelectedPage(pageIndex);
  }, [selectedPage]);

  const handlePlayPause = useCallback(() => {
   // if (!status.isLoaded) return;
    status.playing ? player.pause() : player.play();
  }, [status.isLoaded, status.playing]);

  const handleSkip = useCallback((seconds: number) => {
    if (!status.isLoaded) return;
    const next = Math.max(0, Math.min(status.currentTime + seconds, status.duration));
    player.seekTo(next);
  }, [status.isLoaded, status.currentTime, status.duration]);

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
       <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Page list — scrollable */}
      <ScrollView
      style={{flex:4}}
        contentContainerStyle={{ padding: 32, gap: 12}}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Pages</Text>

        {pages.map((page, i) => {
          const isSelected = selectedPage === i;
          const isPlaying = isSelected && status.playing;
          return (
            <Pressable
              key={i}
              onPress={() => handleSelectPage(i)}
              style={[styles.pageRow, isSelected && styles.pageRowSelected]}
            >
              {/* Page number circle */}
              <View style={[styles.numCircle, isSelected && styles.numCircleSelected]}>
                <Text style={[styles.numText, isSelected && styles.numTextSelected]}>
                  {i + 1}
                </Text>
              </View>

              {/* Page info */}
              <View style={styles.pageInfo}>
                <Text style={styles.pageLabel}>Page {i + 1}</Text>
                <Text style={styles.pagePreview} numberOfLines={1}>
                  { page.text || 'No preview available'}
                </Text>
              </View>

              {/* Playing indicator dot */}
              <View style={[styles.dot, isPlaying && styles.dotActive]} />
            </Pressable>
          );
        })}
      </ScrollView>
      {/* Player — shown only when a page is selected */}
      {selectedPage !== null && (
        <View style={{flex:1}}>
          {/* Progress bar */}
          <View style={styles.progressRow}>
            <Text style={styles.timeText}>{formatTime(status.currentTime)}</Text>
            <View style={styles.trackBg}>
              <View style={[styles.trackFill, { width: `${progress * 100}%` as any }]} />
            </View>
            <Text style={[styles.timeText, { textAlign: 'right' }]}>
              {formatTime(status.duration)}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable
              onPress={() => setSpeedIdx(i => (i + 1) % SPEEDS.length)}
              style={styles.speedBtn}
            >
              <Text style={styles.speedText}>{SPEEDS[speedIdx]}×</Text>
            </Pressable>

            {/* <Pressable onPress={() => handleSkip(-15)} style={styles.skipBtn}>
              <SkipBack size={20} color="#888" />
            </Pressable> */}

            <Button
              onPress={handlePlayPause}
              style={[styles.playBtn]}
             // disabled={!status.isLoaded}
            >
              {status.playing
                ? <Pause size={20} color="#fff" fill="#fff" />
                : <Play size={20} color="#fff" fill="#fff" />
              }
            </Button>
{/* 
            <Pressable onPress={() => handleSkip(15)} style={styles.skipBtn}>
              <SkipForward size={20} color="#888" />
            </Pressable> */}

            <View style={{ width: 44 }} />
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',

  },
 container: {
    flex: 1,
    flexDirection: 'column',
  },
  // Page list
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  pageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  pageRowSelected: {
    backgroundColor: '#f5f5f5',
    borderColor: 'rgba(0,0,0,0.2)',
  },
  numCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numCircleSelected: {
    backgroundColor: '#111',
  },
  numText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  numTextSelected: {
    color: '#fff',
  },
  pageInfo: {
    flex: 1,
    minWidth: 0,
  },
  pageLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  pagePreview: {
    fontSize: 13,
    color: '#111',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  dotActive: {
    backgroundColor: '#3B6D11',
  },

  // Player card
  playerCard: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8,
  },
  playerHeader: {
    padding: 14,
    paddingBottom: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  playerPageLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  playerPreview: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    width: 32,
  },
  trackBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#111',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  speedBtn: {
    width: 44,
    height: 30,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  skipBtn: {
    padding: 8,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnDisabled: {
    backgroundColor: '#ccc',
  },
});