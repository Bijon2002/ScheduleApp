import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, RefreshControl, Image, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { BACKGROUND_IMAGE, BLOCK_COLORS, COLORS } from '../src/utils/theme';
import { loadBlocks, saveBlocks, sortBlocks, timeToMinutes, ScheduleBlock, formatTime } from '../src/utils/storage';
import { rescheduleAll, requestPermissions } from '../src/utils/notifications';
import BlockCard from '../src/components/BlockCard';
import BlockForm from '../src/components/BlockForm';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_MAP_KEY = 'daymap_notif_map';
const APP_IMAGE = require('../src/data/app.png');
const colorKeys = BLOCK_COLORS.map((color) => color.key);

function normalizeBlockColors(blocks: ScheduleBlock[]): ScheduleBlock[] {
  return blocks.map((block, index) => {
    if (colorKeys.includes(block.colorKey)) return block;
    return { ...block, colorKey: BLOCK_COLORS[index % BLOCK_COLORS.length].key };
  });
}

function formatLiveTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function TimelineScreen() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [notifMap, setNotifMap] = useState<Record<string, string>>({});
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<ScheduleBlock | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const load = async () => {
    try {
      const b = await loadBlocks();
      const normalized = normalizeBlockColors(sortBlocks(b));
      if (JSON.stringify(normalized) !== JSON.stringify(sortBlocks(b))) {
        await saveBlocks(normalized);
      }
      setBlocks(normalized);
      const nm = await AsyncStorage.getItem(NOTIF_MAP_KEY);
      if (nm) setNotifMap(JSON.parse(nm));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const persist = async (updated: ScheduleBlock[]) => {
    const sorted = sortBlocks(updated);
    await saveBlocks(sorted);
    const nm = await rescheduleAll(sorted, notifMap);
    setNotifMap(nm);
    await AsyncStorage.setItem(NOTIF_MAP_KEY, JSON.stringify(nm));
    setBlocks(sorted);
  };

  const handleSave = async (block: ScheduleBlock) => {
    const existing = blocks.find(b => b.id === block.id);
    let updated: ScheduleBlock[];
    if (existing) {
      updated = blocks.map(b => b.id === block.id ? block : b);
    } else {
      updated = [...blocks, block];
    }
    await persist(updated);
    setFormVisible(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!editing) return;
    Alert.alert('Delete block?', editing.label, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = blocks.filter(b => b.id !== editing.id);
          await persist(updated);
          setFormVisible(false);
          setEditing(null);
        }
      }
    ]);
  };

  const openAdd = async () => {
    await requestPermissions();
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (block: ScheduleBlock) => {
    setEditing(block);
    setFormVisible(true);
  };

  const currentMins = now.getHours() * 60 + now.getMinutes();
  const nextBlock = blocks.find((block) => timeToMinutes(block.startTime) > currentMins) || blocks[0] || null;
  const enabledNotifications = blocks.filter((block) => block.notify).length;
  const nextColorKey = BLOCK_COLORS[blocks.length % BLOCK_COLORS.length].key;

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={styles.container} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.page}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
      >
        <View style={styles.heroCard}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image source={APP_IMAGE} style={styles.brandImage} />
              <View>
                <Text style={styles.appName}>DayMap</Text>
                <Text style={styles.dateStr}>
                  {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Ionicons name="add-circle" size={18} color={COLORS.bg} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroAccent} />

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="layers-outline" size={16} color={COLORS.primary} />
              <Text style={styles.statValue}>{blocks.length}</Text>
              <Text style={styles.statLabel}>Blocks</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="notifications-outline" size={16} color={COLORS.primary} />
              <Text style={styles.statValue}>{enabledNotifications}</Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.statValue}>{nextBlock ? formatTime(nextBlock.startTime) : '--'}</Text>
              <Text style={styles.statLabel}>Next</Text>
            </View>
          </View>

          {nextBlock ? (
            <>
              <View style={styles.liveClockCard}>
                <View style={styles.liveClockHeader}>
                  <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.liveClockLabel}>Now time</Text>
                </View>
                <Text style={styles.liveClockValue}>{formatLiveTime(now)}</Text>
              </View>
              <View style={styles.nextCard}>
                <View style={styles.nextHeader}>
                  <Text style={styles.nextLabel}>Up next</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="#F87171" />
                </View>
                <Text style={styles.nextTitle}>{nextBlock.label}</Text>
                <Text style={styles.nextSub}>{formatTime(nextBlock.startTime)} - {formatTime(nextBlock.endTime)}</Text>
              </View>
            </>
          ) : null}
        </View>

        {blocks.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyText}>No blocks yet</Text>
            <Text style={styles.emptySub}>Tap + Add to create your first schedule block</Text>
          </View>
        ) : (
          <View style={styles.scrollContent}>
            {blocks.map((block) => {
              const isNow = currentMins >= timeToMinutes(block.startTime) && currentMins < timeToMinutes(block.endTime);
              return (
                <View key={block.id}>
                  {isNow && (
                    <View style={styles.nowIndicator}>
                      <View style={styles.nowDot} />
                      <View style={styles.nowLine} />
                      <Text style={styles.nowText}>Now</Text>
                    </View>
                  )}
                  <BlockCard
                    block={block}
                    onPress={() => openEdit(block)}
                    onLongPress={() => openEdit(block)}
                  />
                </View>
              );
            })}
          <View style={{ height: 24 }} />
          </View>
        )}
      </ScrollView>

      <BlockForm
        visible={formVisible}
        initial={editing}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        onClose={() => { setFormVisible(false); setEditing(null); }}
        defaultColorKey={nextColorKey}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bgImage: { opacity: 0.42 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 10, 24, 0.72)',
  },
  page: { paddingBottom: 24, paddingTop: 8 },
  heroCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  brandImage: { width: 46, height: 46, borderRadius: 8, backgroundColor: COLORS.card },
  brandFallback: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDim,
  },
  brandFallbackText: { color: COLORS.primary, fontWeight: '700' },
  appName: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  dateStr: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, opacity: 0.86 },
  heroAccent: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginTop: 14,
    marginBottom: 14,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    minHeight: 82,
    justifyContent: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginTop: 6 },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3, opacity: 0.88 },
  liveClockCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(5, 18, 40, 0.86)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  liveClockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveClockLabel: { fontSize: 11, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '800' },
  liveClockValue: { fontSize: 30, color: COLORS.textPrimary, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  nextCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(127, 29, 29, 0.72)',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  nextHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLabel: { fontSize: 11, color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '800' },
  nextTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 6 },
  nextSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, opacity: 0.88 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  emptyText: { fontSize: 18, fontWeight: '500', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40, opacity: 0.88 },
  nowIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 70,
    gap: 6,
  },
  nowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  nowLine: { flex: 1, height: 1, backgroundColor: COLORS.primary, opacity: 0.5 },
  nowText: { fontSize: 10, color: COLORS.primary, fontWeight: '800' },
});
