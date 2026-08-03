import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius } from '../../constants/theme';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    pending: { color: '#f39c12', bg: '#f39c1220' },
    approved: { color: '#2ecc71', bg: '#2ecc7120' },
    rejected: { color: '#e74c3c', bg: '#e74c3c20' },
    completed: { color: '#3498db', bg: '#3498db20' },
  };

  const config = statusConfig[status];
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});