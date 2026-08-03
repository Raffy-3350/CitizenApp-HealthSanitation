import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { Spacing, Typography } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

export default function ServicesScreen() {
  const colors = useColors();

  const services = [
    {
      id: 'book-appointment',
      title: 'Book Appointment',
      description: 'Schedule visit to health center or specialist',
      icon: 'calendar-outline' as const,
      route: '/(tabs)/book-appointment',
      color: '#176B87',
    },
    {
      id: 'apply-permit',
      title: 'Apply Sanitation Permit',
      description: 'Apply for business or food establishment permit',
      icon: 'document-text-outline' as const,
      route: '/(tabs)/apply-permit',
      color: '#2ecc71',
    },
    {
      id: 'view-vaccines',
      title: 'View Immunization Records',
      description: "Check your and dependents' vaccine history",
      icon: 'medkit-outline' as const,
      route: '/(tabs)/view-vaccines',
      color: '#3498db',
    },
    {
      id: 'request-service',
      title: 'Request Wastewater Service',
      description: 'Septic tank cleaning and maintenance request',
      icon: 'water-outline' as const,
      route: '/(tabs)/request-service',
      color: '#9b59b6',
    },
    {
      id: 'report-issue',
      title: 'Report Health Issue',
      description: 'Report symptoms, disease cases or violations',
      icon: 'warning-outline' as const,
      route: '/(tabs)/report-issue',
      color: '#e74c3c',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Available Services</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Select a health service to get started</Text>
        </View>

        <View style={styles.servicesList}>
          {services.map((service, index) => (
            <Animated.View key={service.id} entering={FadeInDown.delay(index * 70).springify()}>
              <ServiceCard {...service} />
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.heading,
    color: '#0d4f64',
  },
  subtitle: {
    ...Typography.body,
    color: '#86B6F6',
    marginTop: 2,
  },
  servicesList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
});