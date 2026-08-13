import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export const OfflineBanner: React.FC = () => {
  const colors = useColors();
  const { isOffline, offlineSyncQueueCount, syncOfflineQueueWithSupabase } = useApp();

  if (!isOffline && offlineSyncQueueCount === 0) return null;

  return (
    <View style={[styles.bannerContainer, { backgroundColor: '#7C2D12' }]}>
      <View style={styles.contentRow}>
        <View style={styles.statusIndicator}>
          <Ionicons name="cloud-offline-sharp" size={16} color="#FDBA74" />
          <Text style={[styles.statusText, { color: '#FFEDD5' }]}>
            OFFLINE MODE • Viewing Local Cache {offlineSyncQueueCount > 0 ? `(${offlineSyncQueueCount} Queue Pending)` : ''}
          </Text>
        </View>

        {offlineSyncQueueCount > 0 && (
          <TouchableOpacity style={styles.syncBtn} onPress={syncOfflineQueueWithSupabase}>
            <Ionicons name="sync" size={13} color="#ffffff" />
            <Text style={styles.syncBtnText}>Sync Outbox</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  syncBtnText: {
    ...Typography.caption,
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 10.5,
  },
});
