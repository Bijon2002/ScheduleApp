import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Switch, Modal, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, BLOCK_COLORS } from '../utils/theme';
import { ScheduleBlock, minutesToTime, timeToMinutes } from '../utils/storage';
import uuid from 'react-native-uuid';

interface Props {
  visible: boolean;
  initial?: ScheduleBlock | null;
  defaultColorKey?: string;
  onSave: (block: ScheduleBlock) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function timeStringToDate(t: string): Date {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export default function BlockForm({ visible, initial, defaultColorKey = 'yellow', onSave, onDelete, onClose }: Props) {
  const [label, setLabel] = useState(initial?.label || '');
  const [subLabel, setSubLabel] = useState(initial?.subLabel || '');
  const [pinNote, setPinNote] = useState(initial?.pinNote || '');
  const [startTime, setStartTime] = useState(initial?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initial?.endTime || '10:00');
  const [colorKey, setColorKey] = useState(initial?.colorKey || defaultColorKey);
  const [notify, setNotify] = useState(initial?.notify ?? true);
  const [recurring, setRecurring] = useState(initial?.recurring ?? true);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setLabel(initial?.label || '');
      setSubLabel(initial?.subLabel || '');
      setPinNote(initial?.pinNote || '');
      setStartTime(initial?.startTime || '09:00');
      setEndTime(initial?.endTime || '10:00');
      setColorKey(initial?.colorKey || defaultColorKey);
      setNotify(initial?.notify ?? true);
      setRecurring(initial?.recurring ?? true);
    }
  }, [visible, initial, defaultColorKey]);

  const handleSave = async () => {
    if (!label.trim()) return;
    await Promise.resolve(onSave({
      id: initial?.id || String(uuid.v4()),
      label: label.trim(),
      subLabel: subLabel.trim() || undefined,
      pinNote: pinNote.trim() || undefined,
      startTime,
      endTime,
      colorKey,
      notify,
      recurring,
    }));
  };

  const colorDef = BLOCK_COLORS.find(c => c.key === colorKey) || BLOCK_COLORS[0];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <View style={styles.headerAction}>
              <Ionicons name="close-outline" size={18} color={COLORS.textPrimary} />
              <Text style={styles.cancel}>Cancel</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>{initial ? 'Edit Block' : 'New Block'}</Text>
          <TouchableOpacity
            style={[styles.saveBtn, !label.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!label.trim()}
            activeOpacity={0.85}
          >
            <View style={styles.headerAction}>
              <Ionicons name="save-outline" size={17} color={COLORS.bg} />
              <Text style={styles.saveText}>Save</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Label */}
          <Text style={styles.sectionLabel}>Label *</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Cycling"
            placeholderTextColor={COLORS.textTertiary}
          />

          <Text style={styles.sectionLabel}>Subtitle</Text>
          <TextInput
            style={styles.input}
            value={subLabel}
            onChangeText={setSubLabel}
            placeholder="Optional details"
            placeholderTextColor={COLORS.textTertiary}
          />

          <Text style={styles.sectionLabel}>Pin note</Text>
          <TextInput
            style={styles.input}
            value={pinNote}
            onChangeText={setPinNote}
            placeholder="e.g. Daily until May 16"
            placeholderTextColor={COLORS.textTertiary}
          />

          {/* Times */}
          <View style={styles.timeRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.sectionLabel}>Start</Text>
              <TouchableOpacity style={styles.timePill} onPress={() => setShowStart(true)}>
                <Text style={styles.timePillText}>{startTime}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeBlock}>
              <Text style={styles.sectionLabel}>End</Text>
              <TouchableOpacity style={styles.timePill} onPress={() => setShowEnd(true)}>
                <Text style={styles.timePillText}>{endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStart && (
            <DateTimePicker
              value={timeStringToDate(startTime)}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="dark"
              onChange={(_, d) => {
                setShowStart(Platform.OS === 'ios');
                if (d) setStartTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
              }}
            />
          )}
          {showEnd && (
            <DateTimePicker
              value={timeStringToDate(endTime)}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="dark"
              onChange={(_, d) => {
                setShowEnd(Platform.OS === 'ios');
                if (d) setEndTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
              }}
            />
          )}

          {/* Color picker */}
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.colorRow}>
            {BLOCK_COLORS.map(c => (
              <TouchableOpacity
                key={c.key}
                style={[styles.colorDot, { backgroundColor: c.color }, colorKey === c.key && styles.colorDotActive]}
                onPress={() => setColorKey(c.key)}
              />
            ))}
          </View>

          {/* Toggles */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <View style={styles.toggleLabelRow}>
                <Ionicons name="notifications-outline" size={18} color={colorDef.color} />
                <Text style={styles.toggleLabel}>Notification</Text>
              </View>
              <Switch
                value={notify}
                onValueChange={setNotify}
                trackColor={{ false: COLORS.border, true: colorDef.color }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
            <View style={styles.toggleItem}>
              <View style={styles.toggleLabelRow}>
                <Ionicons name="repeat-outline" size={18} color={colorDef.color} />
                <Text style={styles.toggleLabel}>Repeat daily</Text>
              </View>
              <Switch
                value={recurring}
                onValueChange={setRecurring}
                trackColor={{ false: COLORS.border, true: colorDef.color }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          </View>

          {/* Delete */}
          {initial && onDelete && (
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Text style={styles.deleteText}>Delete Block</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cancel: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  headerAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnDisabled: { backgroundColor: COLORS.primaryLight, opacity: 0.65 },
  saveText: { fontSize: 15, color: COLORS.bg, fontWeight: '800' },
  scroll: { flex: 1, padding: 16, backgroundColor: COLORS.bg },
  sectionLabel: { fontSize: 12, color: COLORS.primary, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '800' },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 13,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeBlock: { flex: 1 },
  timePill: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timePillText: { fontSize: 20, color: COLORS.textPrimary, fontWeight: '800', letterSpacing: 1 },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 4 },
  colorDot: { width: 32, height: 32, borderRadius: 8 },
  colorDotActive: { borderWidth: 3, borderColor: COLORS.textPrimary },
  toggleRow: { marginTop: 16, gap: 4 },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  toggleLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  deleteBtn: {
    marginTop: 24,
    backgroundColor: COLORS.dangerDim,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  deleteText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },
});
