import { useTheme } from "@/src/context/ThemeContext";
import {
    ApplySanitationPermitModal,
    BookAppointmentModal,
} from "@/src/features/dashboard/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ReportHealthIssueScreen } from "./ReportHealthIssueScreen";
import { RequestWastewaterServiceScreen } from "./RequestWastewaterServiceScreen";
import { styles } from "./styles/ServicesCatalogScreen.styles";

interface Service {
  title: string;
  description: string;
  category: string;
  actionText: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const SERVICES: Service[] = [
  {
    title: "Book Health Appointment",
    description: "Schedule a visit with a city health center or medical clinic.",
    category: "APPOINTMENT",
    actionText: "Start Booking",
    icon: "calendar-outline",
    color: "#38BDF8",
  },
  {
    title: "Apply Sanitation Permit",
    description: "Submit your application for a sanitation permit online.",
    category: "PERMIT APPLICATION",
    actionText: "Apply Now",
    icon: "document-text-outline",
    color: "#A78BFA",
  },
  {
    title: "Request Wastewater Service",
    description: "Request wastewater assistance and follow your service status.",
    category: "SANITATION SERVICE",
    actionText: "Request Service",
    icon: "water-outline",
    color: "#34D399",
  },
  {
    title: "Report Health & Sanitation Issue",
    description: "Send a community report to the health and sanitation team.",
    category: "CITIZEN REPORT",
    actionText: "Create Report",
    icon: "flag-outline",
    color: "#FBBF24",
  },
];

export function ServicesCatalogScreen() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeService, setActiveService] = useState<Service["category"] | null>(null);

  const filterOptions = useMemo(
    () => ["All", ...new Set(SERVICES.map((service) => service.category))],
    []
  );

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return SERVICES.filter((service) => {
      const matchesFilter =
        activeFilter === "All" || service.category === activeFilter;
      const matchesQuery =
        query.length === 0 ||
        [
          service.title,
          service.description,
          service.category,
          service.actionText,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, searchQuery]);

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: "#0B132B" }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, isDarkMode && { color: "#F8FAFC" }]}>Services</Text>
        <Text style={[styles.screenSubtitle, isDarkMode && { color: "#CBD5E1" }]}>Health and sanitation services</Text>

        <View style={[styles.searchBar, isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B" }]}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search services..."
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput, isDarkMode && { color: "#F8FAFC" }]}
            clearButtonMode="never"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(filter)}
                style={[styles.filterChip, isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B" }, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={28} color="#94A3B8" />
            <Text style={[styles.emptyStateTitle, isDarkMode && { color: "#F8FAFC" }]}>No services found</Text>
          <Text style={[styles.emptyStateText, isDarkMode && { color: "#94A3B8" }]}>
              Try another keyword or search term.
            </Text>
          </View>
        ) : (
          filteredServices.map((service) => (
            <View key={service.title} style={[styles.serviceCard, isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B" }]}>
              <View style={styles.serviceTopRow}>
                <View
                  style={[
                    styles.serviceIconBox,
                    { backgroundColor: `${service.color}22` },
                  ]}
                >
                  <Ionicons name={service.icon} size={24} color={service.color} />
                </View>
                <Text style={[styles.serviceCategory, { color: service.color }]}>
                  {service.category}
                </Text>
              </View>

              <Text style={[styles.serviceTitle, isDarkMode && { color: "#F8FAFC" }]}>{service.title}</Text>
              <Text style={[styles.serviceDescription, isDarkMode && { color: "#CBD5E1" }]}>{service.description}</Text>

              <View style={styles.serviceDivider} />

              <View style={styles.serviceFooter}>
                <Text style={[styles.serviceActionText, { color: service.color }]}>
                  {service.actionText}
                </Text>
                <TouchableOpacity
                  accessibilityLabel={service.actionText}
                  activeOpacity={0.8}
                  onPress={() => setActiveService(service.category)}
                  style={[
                    styles.serviceArrowButton,
                    { backgroundColor: service.color },
                  ]}
                >
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BookAppointmentModal
        visible={activeService === "APPOINTMENT"}
        onClose={() => setActiveService(null)}
      />
      <ApplySanitationPermitModal
        visible={activeService === "PERMIT APPLICATION"}
        onClose={() => setActiveService(null)}
      />
      <RequestWastewaterServiceScreen
        visible={activeService === "SANITATION SERVICE"}
        onClose={() => setActiveService(null)}
      />
      <ReportHealthIssueScreen
        visible={activeService === "CITIZEN REPORT"}
        onClose={() => setActiveService(null)}
      />
    </View>
  );
}
