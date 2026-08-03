import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  icon: IoniconsName;
  route: string;
  color: string;
}

export function ServiceCard({
  title,
  description,
  icon,
  route,
  color,
}: ServiceCardProps) {
  const router = useRouter();
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
      onPress={() => router.push(route as any)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrapper, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.subtext }]}>{description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
    marginBottom: 2,
  },
  description: {
    ...Typography.small,
    color: '#86B6F6',
  },
});
