import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function ServicesScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useApp();

  const transactionServices = [
    {
      id: 'book-appointment',
      title: 'Book Health Appointment',
      subtitle: 'Schedule routine checkups, consultations, or dental care at local health centers.',
      tag: 'APPOINTMENT',
      cta: 'Start Booking',
      icon: 'calendar-outline' as const,
      route: '/(tabs)/book-appointment',
      color: '#176B87',
    },
    {
      id: 'apply-permit',
      title: 'Apply Sanitation Permit',
      subtitle: 'Apply for business, food establishment, or water refilling sanitary permits.',
      tag: 'PERMIT APPLICATION',
      cta: 'Apply Now',
      icon: 'document-text-outline' as const,
      route: '/(tabs)/apply-permit',
      color: '#059669',
    },
    {
      id: 'request-service',
      title: 'Request Wastewater Service',
      subtitle: 'Schedule residential septic tank desludging & cleaning maintenance.',
      tag: 'SANITATION SERVICE',
      cta: 'Schedule Cleaning',
      icon: 'water-outline' as const,
      route: '/(tabs)/request-service',
      color: '#0284C7',
    },
    {
      id: 'report-issue',
      title: 'Report Health & Sanitation Issue',
      subtitle: 'Report Dengue mosquito breeding sites, improper waste, or health violations.',
      tag: 'CITIZEN REPORT',
      cta: 'Submit Report',
      icon: 'warning-outline' as const,
      route: '/(tabs)/report-issue',
      color: '#DC2626',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Ionicons name="flash-outline" size={14} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>OFFICIAL CITY SERVICES</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Services</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Initiate new applications, appointments, requests & reports
          </Text>
        </View>

        {/* Services List */}
        <View style={styles.servicesList}>
          {transactionServices.map((service, index) => (
            <Animated.View key={service.id} entering={FadeInDown.delay(index * 80).springify()}>
              <TouchableOpacity
                style={[
                  styles.serviceCard,
                  { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                ]}
                activeOpacity={0.88}
                onPress={() => router.push(service.route as any)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: service.color + '15' }]}>
                    <Ionicons name={service.icon} size={24} color={service.color} />
                  </View>
                  <View style={[styles.tagPill, { backgroundColor: service.color + '12' }]}>
                    <Text style={[styles.tagText, { color: service.color }]}>{service.tag}</Text>
                  </View>
                </View>

                <Text style={[styles.cardTitle, { color: colors.text }]}>{service.title}</Text>
                <Text style={[styles.cardSub, { color: colors.subtext }]}>{service.subtitle}</Text>

                <View style={[styles.ctaRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.ctaText, { color: service.color }]}>{service.cta}</Text>
                  <View style={[styles.ctaCircle, { backgroundColor: service.color }]}>
                    <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 30 }} />
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C715',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    ...Typography.heading,
    color: '#0d4f64',
    fontSize: 22,
  },
  subtitle: {
    ...Typography.body,
    color: '#86B6F6',
    marginTop: 2,
    fontSize: 13,
  },
  servicesList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  serviceCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    ...Typography.subheading,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  ctaText: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 13,
  },
  ctaCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});