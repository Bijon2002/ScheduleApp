import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKGROUND_IMAGE, COLORS } from '../src/utils/theme';
import { loadBlocks, saveBlocks, exportJSON, importJSON, saveImportedSchedule } from '../src/utils/storage';
import { cancelAllNotifications, rescheduleAll } from '../src/utils/notifications';
import { SAMPLE_SCHEDULE } from '../src/data/sampleSchedule';

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blocks = await loadBlocks();
      await exportJSON(blocks);
    } catch (e) {
      Alert.alert('Export failed', String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const blocks = await importJSON();
      if (!blocks) { setLoading(false); return; }
      Alert.alert('Import', `Found ${blocks.length} blocks. Replace current schedule?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace', style: 'destructive', onPress: async () => {
            await saveBlocks(blocks);
            await rescheduleAll(blocks, {});
            Alert.alert('Done', 'Schedule imported successfully.');
          }
        }
      ]);
    } catch (e) {
      Alert.alert('Import failed', String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleSchedule = async () => {
    setLoading(true);
    try {
      const blocks = await saveImportedSchedule(SAMPLE_SCHEDULE);
      await rescheduleAll(blocks, {});
      Alert.alert('Saved', 'The pasted schedule was stored in the app.');
    } catch (e) {
      Alert.alert('Save failed', String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert('Clear all blocks?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all', style: 'destructive', onPress: async () => {
          await saveBlocks([]);
          await cancelAllNotifications();
          Alert.alert('Cleared', 'All blocks removed.');
        }
      }
    ]);
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={styles.container} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTitleRow}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.heading}>Settings</Text>
          </View>
          <Text style={styles.heroText}>Manage backups, imports, and local schedule data.</Text>
        </View>

        <Text style={styles.section}>Data</Text>

        <TouchableOpacity style={styles.row} onPress={handleExport} disabled={loading}>
          <View style={styles.rowIconWrap}>
            <Ionicons name="download-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Export schedule</Text>
            <Text style={styles.rowSub}>Save as JSON file</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleImport} disabled={loading}>
          <View style={styles.rowIconWrap}>
            <Ionicons name="cloud-upload-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Import schedule</Text>
            <Text style={styles.rowSub}>Load from JSON file</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleLoadSampleSchedule} disabled={loading}>
          <View style={styles.rowIconWrap}>
            <Ionicons name="clipboard-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Store pasted schedule</Text>
            <Text style={styles.rowSub}>Save the provided JSON into app storage</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.section}>Danger zone</Text>

        <TouchableOpacity style={[styles.row, styles.dangerRow]} onPress={handleClearAll}>
          <View style={styles.rowIconWrap}>
            <Ionicons name="trash-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: COLORS.primary }]}>Clear all blocks</Text>
            <Text style={styles.rowSub}>Removes everything & cancels notifications</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.version}>DayMap v1.0</Text>
      </ScrollView>
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
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 24 },
  heroCard: {
    padding: 18,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  heading: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  heroText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8, lineHeight: 19, opacity: 0.88 },
  section: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  dangerRow: { borderColor: COLORS.primary, backgroundColor: COLORS.dangerDim },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  rowSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, opacity: 0.88 },
  version: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'center', marginTop: 40 },
});
