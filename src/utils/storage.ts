import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export interface ScheduleBlock {
  id: string;
  label: string;
  subLabel?: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  colorKey: string;
  notify: boolean;
  recurring: boolean; // repeat daily
  pinNote?: string;
  dayOverride?: string; // "YYYY-MM-DD" if not recurring
}

export interface ImportedScheduleItem {
  time: string;
  task: string;
  description?: string;
  duration?: string;
  tag?: string;
  condition?: string;
  repeat?: string;
}

export interface ImportedSchedulePayload {
  schedule: ImportedScheduleItem[];
}

const STORAGE_KEY = 'daymap_blocks';
const IMPORT_COLOR_KEYS = ['yellow', 'cyan', 'violet', 'green', 'orange', 'pink', 'blue', 'red'];

export async function loadBlocks(): Promise<ScheduleBlock[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveBlocks(blocks: ScheduleBlock[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

function buildBlockNotes(item: ImportedScheduleItem): string[] {
  const notes: string[] = [];
  if (item.description) notes.push(item.description);
  if (item.duration) notes.push(item.duration);
  if (item.tag) notes.push(`Tag: ${item.tag}`);
  if (item.condition) notes.push(`Condition: ${item.condition}`);
  if (item.repeat) notes.push(`Repeat: ${item.repeat}`);
  return notes;
}

function parseBlockTimes(timeRange: string): { startTime: string; endTime: string } | null {
  const match = /^([0-2]\d:[0-5]\d)-([0-2]\d:[0-5]\d)$/.exec(timeRange.trim());
  if (!match) return null;
  return { startTime: match[1], endTime: match[2] };
}

export function importSchedulePayload(payload: ImportedSchedulePayload): ScheduleBlock[] {
  if (!payload || !Array.isArray(payload.schedule)) return [];

  const blocks: Array<ScheduleBlock | null> = payload.schedule
    .map((item, index) => {
      const times = parseBlockTimes(item.time);
      if (!times) return null;

      const notes = buildBlockNotes(item);
      return {
        id: `imported-${index}-${Date.now()}`,
        label: item.task,
        subLabel: notes.length > 0 ? notes.join(' · ') : undefined,
        startTime: times.startTime,
        endTime: times.endTime,
        colorKey: IMPORT_COLOR_KEYS[index % IMPORT_COLOR_KEYS.length],
        notify: item.condition !== 'conditional',
        recurring: typeof item.repeat === 'string' && item.repeat.toLowerCase().includes('daily'),
        pinNote: item.condition,
      } satisfies ScheduleBlock;
    })
    ;

  return blocks.filter((block): block is ScheduleBlock => block !== null);
}

export async function saveImportedSchedule(payload: ImportedSchedulePayload): Promise<ScheduleBlock[]> {
  const blocks = sortBlocks(importSchedulePayload(payload));
  await saveBlocks(blocks);
  return blocks;
}

export async function exportJSON(blocks: ScheduleBlock[]): Promise<void> {
  const json = JSON.stringify({ version: 1, blocks }, null, 2);
  const path = FileSystem.documentDirectory + 'daymap_export.json';
  await FileSystem.writeAsStringAsync(path, json);
  await Sharing.shareAsync(path, { mimeType: 'application/json' });
}

export async function importJSON(): Promise<ScheduleBlock[] | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return null;
    const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const parsed = JSON.parse(raw);
    if (parsed.version === 1 && Array.isArray(parsed.blocks)) {
      return parsed.blocks;
    }
    return null;
  } catch {
    return null;
  }
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function getDuration(start: string, end: string): string {
  const diff = timeToMinutes(end) - timeToMinutes(start);
  if (diff <= 0) return '';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function sortBlocks(blocks: ScheduleBlock[]): ScheduleBlock[] {
  return [...blocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

export interface AppImage {
  uri: string;
  name?: string;
}

const IMAGES_KEY = 'daymap_images';
const APP_IMAGE_KEY = 'daymap_app_image';

export async function saveImages(images: AppImage[]): Promise<void> {
  await AsyncStorage.setItem(IMAGES_KEY, JSON.stringify(images));
}

export async function loadImages(): Promise<AppImage[]> {
  try {
    const raw = await AsyncStorage.getItem(IMAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function setAppImageUri(uri: string | null): Promise<void> {
  if (uri) await AsyncStorage.setItem(APP_IMAGE_KEY, uri);
  else await AsyncStorage.removeItem(APP_IMAGE_KEY);
}

export async function getAppImageUri(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(APP_IMAGE_KEY);
  } catch {
    return null;
  }
}
