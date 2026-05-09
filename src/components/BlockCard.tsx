import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BLOCK_COLORS } from '../utils/theme';
import { ScheduleBlock, formatTime, getDuration } from '../utils/storage';

interface Props {
  block: ScheduleBlock;
  onPress: () => void;
  onLongPress: () => void;
}

export default function BlockCard({ block, onPress, onLongPress }: Props) {
  const colorDef = BLOCK_COLORS.find(c => c.key === block.colorKey) || BLOCK_COLORS[0];

  return (
    <TouchableOpacity
      style={[styles.row, { borderColor: colorDef.color === '#FFFFFF' ? COLORS.border : colorDef.color + '66' }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.timeCol, { borderLeftColor: colorDef.color }]}>
        <Text style={styles.timeText}>{formatTime(block.startTime)}</Text>
        <Ionicons name="arrow-down" size={12} color={colorDef.color} />
        <Text style={styles.timeText}>{formatTime(block.endTime)}</Text>
      </View>

      <View style={[styles.accent, { backgroundColor: colorDef.color }]} />

      <View style={[styles.card, { borderColor: colorDef.color === '#FFFFFF' ? COLORS.border : colorDef.color + '44' }]}>
        <View style={styles.cardTop}>
          <Text style={styles.label} numberOfLines={1}>{block.label}</Text>
          <View style={styles.badges}>
            {block.notify && <Ionicons name="notifications" size={14} color={colorDef.color} />}
            {block.recurring && <Ionicons name="repeat" size={14} color={colorDef.color} />}
          </View>
        </View>
        {block.subLabel ? <Text style={styles.sub} numberOfLines={2}>{block.subLabel}</Text> : null}
        {block.pinNote ? (
          <View style={styles.pinRow}>
            <Ionicons name="bookmark-outline" size={13} color={COLORS.amber} />
            <Text style={styles.pin}>{block.pinNote}</Text>
          </View>
        ) : null}
        <View style={[styles.durPill, { backgroundColor: colorDef.dim }]}>
          <Text style={[styles.durText, { color: colorDef.color }]}>
            {getDuration(block.startTime, block.endTime)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    ...(Platform.OS === 'android'
      ? { elevation: 3 }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.16,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        }),
  },
  timeCol: {
    width: 64,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 12,
    justifyContent: 'center',
    gap: 2,
    borderLeftWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  accent: {
    width: 10,
    minHeight: 58,
  },
  card: {
    flex: 1,
    padding: 14,
    backgroundColor: COLORS.card,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  sub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 5,
    lineHeight: 17,
    opacity: 0.9,
  },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  pin: {
    fontSize: 11,
    color: COLORS.amber,
    fontWeight: '800',
  },
  durPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  durText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
