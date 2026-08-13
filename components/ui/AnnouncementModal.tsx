import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Announcement } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

interface AnnouncementModalProps {
  visible: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onActionPress?: (route?: string) => void;
}

export function AnnouncementModal({
  visible,
  announcement,
  onClose,
  onActionPress,
}: AnnouncementModalProps) {
  const colors = useColors();

  if (!announcement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.modalContent, { backgroundColor: colors.card }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header Bar with Icon & Category */}
          <View style={styles.headerRow}>
            <View style={styles.categoryBadgeRow}>
              <View style={[styles.iconCircle, { backgroundColor: announcement.color + '20' }]}>
                <Ionicons name={announcement.icon as any} size={20} color={announcement.color} />
              </View>
              <View>
                <View style={[styles.pillBadge, { backgroundColor: announcement.color + '15' }]}>
                  <Text style={[styles.pillText, { color: announcement.color }]}>
                    {announcement.category}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Title & Subtitle */}
            <Text style={[styles.title, { color: colors.text }]}>{announcement.title}</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>{announcement.subtitle}</Text>

            {/* Date & Location Box */}
            <View style={[styles.metaBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.text }]}>{announcement.date}</Text>
              </View>
              {announcement.location && (
                <View style={[styles.metaRow, { marginTop: 6 }]}>
                  <Ionicons name="location-outline" size={16} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.text }]}>{announcement.location}</Text>
                </View>
              )}
            </View>

            {/* Citizen Advisory Tag */}
            <View style={styles.roleTagRow}>
              <Ionicons name="people-outline" size={14} color="#10B981" />
              <Text style={styles.roleTagText}>Official Public Citizen Advisory</Text>
            </View>

            {/* Full Message */}
            <Text style={[styles.contentText, { color: colors.text }]}>
              {announcement.content}
            </Text>
          </ScrollView>

          {/* Footer Action Button */}
          <View style={styles.footerRow}>
            {announcement.actionRoute && announcement.actionLabel ? (
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  onClose();
                  if (onActionPress) {
                    onActionPress(announcement.actionRoute);
                  }
                }}
              >
                <Text style={styles.actionBtnText}>{announcement.actionLabel}</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.closeModalBtn, { backgroundColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.closeModalBtnText, { color: colors.text }]}>Close Advisory</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 79, 100, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    width: '100%',
    maxHeight: '82%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  closeBtn: {
    padding: 6,
  },
  bodyScroll: {
    marginVertical: Spacing.xs,
  },
  title: {
    ...Typography.subheading,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  metaBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 13,
  },
  roleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
    backgroundColor: '#10B98115',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  roleTagText: {
    ...Typography.caption,
    color: '#059669',
    fontWeight: '600',
    fontSize: 12,
  },
  contentText: {
    ...Typography.body,
    lineHeight: 22,
    fontSize: 14,
  },
  footerRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEF5FF',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionBtnText: {
    ...Typography.body,
    color: '#ffffff',
    fontWeight: '700',
  },
  closeModalBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  closeModalBtnText: {
    ...Typography.body,
    fontWeight: '600',
  },
});
