import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';

// ─── Constants ───────────────────────────────────────────────────────────────

const CALOOCAN_CENTER: [number, number] = [14.6507, 120.9679];
const BARANGAY_CENTER: [number, number] = [14.655, 120.973];
const CALOOCAN_BOUNDS = [[14.58, 120.9], [14.82, 121.15]];

const STANDARD_TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_TILE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// ─── Disease Data ─────────────────────────────────────────────────────────────

export interface DiseasePin {
  id: string;
  name: string;
  color: string;
  radius: number;
  lat: number;
  lng: number;
  iconName: keyof typeof Ionicons.glyphMap;
  risk: 'High' | 'Moderate' | 'Low';
  probability: number;
  insight: string;
  action: string;
  cases: number;
}

const DISEASES: DiseasePin[] = [
  {
    id: 'dengue',
    name: 'Dengue',
    color: '#EF4444',
    radius: 420,
    lat: 14.655,
    lng: 120.973,
    iconName: 'water',
    risk: 'High',
    probability: 78,
    insight:
      'Stagnant water detected in 3 flood-prone zones. Aedes aegypti breeding confirmed by barangay health workers along low-lying creek areas.',
    action:
      'Eliminate standing water, use mosquito repellent, wear long sleeves from dusk to dawn.',
    cases: 14,
  },
  {
    id: 'lepto',
    name: 'Leptospirosis',
    color: '#F97316',
    radius: 340,
    lat: 14.644,
    lng: 120.959,
    iconName: 'rainy',
    risk: 'Moderate',
    probability: 54,
    insight:
      'Flood residue and rodent activity reported near drainage channels. Risk elevated post-rainfall in Zones 4 and 7.',
    action:
      'Avoid wading in floodwater, wear rubber boots, report dead rodents to your barangay health center.',
    cases: 6,
  },
  {
    id: 'rabies',
    name: 'Rabies',
    color: '#EAB308',
    radius: 280,
    lat: 14.661,
    lng: 120.962,
    iconName: 'paw',
    risk: 'Moderate',
    probability: 41,
    insight:
      '2 animal bite incidents reported this week. Stray animal population density above threshold in adjacent barangay.',
    action:
      'Report stray animals, get pets vaccinated, seek immediate treatment for any animal bite.',
    cases: 3,
  },
  {
    id: 'malaria',
    name: 'Malaria',
    color: '#A855F7',
    radius: 240,
    lat: 14.638,
    lng: 120.978,
    iconName: 'bug',
    risk: 'Low',
    probability: 18,
    insight:
      'Vector control spraying completed. Anopheles mosquito activity monitored. No active cases confirmed this month.',
    action:
      'Use insect repellent, sleep under treated nets, participate in community clean-up drives.',
    cases: 0,
  },
];

const RISK_COLORS = {
  High: '#EF4444',
  Moderate: '#F97316',
  Low: '#22C55E',
} as const;

// ─── Leaflet HTML Generator ───────────────────────────────────────────────────

function getLeafletMapHtml(
  mapStyle: 'standard' | 'satellite',
  isFocusedOnBarangay: boolean
): string {
  const center = isFocusedOnBarangay ? BARANGAY_CENTER : CALOOCAN_CENTER;
  const zoom = isFocusedOnBarangay ? 15 : 13;
  const tileUrl = mapStyle === 'satellite' ? SATELLITE_TILE : STANDARD_TILE;
  const tileAttr =
    mapStyle === 'satellite'
      ? '&copy; Esri, Maxar, Earthstar Geographics'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const boundsJson = JSON.stringify(CALOOCAN_BOUNDS);
  const diseasesJson = JSON.stringify(
    DISEASES.map((d) => ({ id: d.id, name: d.name, color: d.color, radius: d.radius, lat: d.lat, lng: d.lng, risk: d.risk }))
  ).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
  .leaflet-control-attribution { font-size: 9px !important; }
  .leaflet-control-zoom { margin-bottom: 12px !important; margin-left: 12px !important; }
  .leaflet-control-zoom a {
    background: rgba(255,255,255,0.92) !important;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(0,0,0,0.12) !important;
    color: #1e293b !important;
    font-weight: 700 !important;
    border-radius: 8px !important;
    width: 30px !important; height: 30px !important;
    line-height: 30px !important;
  }

  @keyframes aura-pulse {
    0%   { transform: translate(-50%, -110%) scale(0.9); opacity: 0.75; }
    100% { transform: translate(-50%, -110%) scale(3.0); opacity: 0; }
  }
  .red-aura-pulse {
    position: absolute;
    top: 0; left: 50%;
    width: 30px; height: 30px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.38);
    animation: aura-pulse 2s ease-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  .user-pin-wrapper {
    position: relative;
    width: 34px;
    height: 42px;
  }
  .user-pin-wrapper svg { position: relative; z-index: 1; }

  .disease-tooltip {
    background: rgba(15,23,42,0.85) !important;
    border: none !important;
    border-radius: 8px !important;
    color: #f8fafc !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    padding: 5px 10px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
    white-space: nowrap;
  }
  .disease-tooltip::before { display: none !important; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function() {
  var center = [${center[0]}, ${center[1]}];
  var caloocanBounds = ${boundsJson};
  var diseases = ${diseasesJson};

  var map = L.map('map', {
    zoomControl: false,
    minZoom: 12,
    maxZoom: 18,
    maxBounds: caloocanBounds,
    maxBoundsViscosity: 1.0,
  }).setView(center, ${zoom});

  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  L.tileLayer('${tileUrl}', {
    maxZoom: 18,
    attribution: '${tileAttr}',
  }).addTo(map);

  // ── Hazard radar circles ──
  diseases.forEach(function(d) {
    var circle = L.circle([d.lat, d.lng], {
      radius: d.radius,
      color: d.color,
      weight: 2.5,
      opacity: 0.9,
      fillColor: d.color,
      fillOpacity: 0.35,
    }).addTo(map);

    circle.bindTooltip(
      '<span style="color:' + d.color + '">\u25cf</span> ' + d.name + ' &mdash; ' + d.risk + ' Risk',
      { className: 'disease-tooltip', direction: 'top', sticky: false }
    );
  });

  // ── GPS user marker with pulsating aura ──
  var userPoint = [${BARANGAY_CENTER[0]}, ${BARANGAY_CENTER[1]}];
  var pinHtml =
    '<div class="user-pin-wrapper">' +
      '<div class="red-aura-pulse"></div>' +
      '<svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M17 1C8.2 1 1 8.2 1 17c0 11.7 16 23 16 23s16-11.3 16-23C33 8.2 25.8 1 17 1z"' +
          ' fill="#EF4444" stroke="white" stroke-width="3"/>' +
        '<circle cx="17" cy="17" r="6" fill="white"/>' +
        '<circle cx="17" cy="17" r="3" fill="#EF4444"/>' +
      '</svg>' +
    '</div>';

  var userIcon = L.divIcon({
    className: '',
    html: pinHtml,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -44],
  });

  L.marker(userPoint, { icon: userIcon })
    .addTo(map)
    .bindPopup(
      '<div style="font-family:system-ui;padding:2px 0">' +
        '<strong style="color:#EF4444">Your Location</strong><br/>' +
        '<span style="font-size:12px;color:#64748b">Barangay 171, Caloocan City</span>' +
      '</div>',
      { maxWidth: 200 }
    );
})();
</script>
</body>
</html>`;
}

// ─── Native Pulse Marker ──────────────────────────────────────────────────────

function NativePulseMarker({ color, onPress }: { color: string; onPress: () => void }) {
  const pulse = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        RNAnimated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={nativeStyles.markerWrap}>
      <RNAnimated.View
        style={[
          nativeStyles.pulseRing,
          { backgroundColor: color, transform: [{ scale: pulseScale }], opacity: pulseOpacity },
        ]}
      />
      <View style={[nativeStyles.markerDot, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function AlertsScreen() {
  const { isDarkMode } = useTheme();

  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [isFocusedOnBarangay, setIsFocusedOnBarangay] = useState(false);
  const [locateKey, setLocateKey] = useState(0);
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<DiseasePin | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapHtml = useMemo(
    () => getLeafletMapHtml(mapStyle, isFocusedOnBarangay),
    [mapStyle, isFocusedOnBarangay]
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleLocateMe = useCallback(async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      setIsFocusedOnBarangay(true);
      setLocateKey((k) => k + 1);
      setShowLocationBanner(true);
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      bannerTimer.current = setTimeout(() => setShowLocationBanner(false), 2500);
    } catch {
      /* silently ignore */
    }
  }, []);

  const handleTileToggle = useCallback(() => {
    setMapStyle((s) => (s === 'standard' ? 'satellite' : 'standard'));
    setLocateKey((k) => k + 1);
  }, []);

  const handleDiseaseChip = useCallback((disease: DiseasePin) => {
    setActiveFilter((prev) => {
      if (prev === disease.id) {
        setSelectedDisease(null);
        return null;
      }
      setSelectedDisease(disease);
      return disease.id;
    });
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedDisease(null);
    setActiveFilter(null);
  }, []);

  useEffect(() => {
    return () => {
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    };
  }, []);

  // ── Theme shortcuts ──────────────────────────────────────────────────────────

  const bg = isDarkMode ? '#0B132B' : '#F0F4F8';
  const cardBg = isDarkMode ? '#1C2541' : '#FFFFFF';
  const cardBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const textPrimary = isDarkMode ? '#F8FAFC' : '#0F172A';
  const textMuted = isDarkMode ? '#94A3B8' : '#64748B';

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {/* ── Map Container ── */}
      <View style={[styles.mapContainer, { backgroundColor: isDarkMode ? '#0B132B' : '#DDE7EA' }]}>
        {/* Leaflet iframe (Web) or WebView (Native) */}
        {Platform.OS === 'web' ? (
          <iframe
            key={locateKey}
            title="Disease Surveillance Map"
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        ) : (
          <WebView
            key={locateKey}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.webView}
            javaScriptEnabled
            scrollEnabled={false}
          />
        )}

        {/* ── Disease Counter Chips (floating top) ── */}
        <View style={styles.chipsRow} pointerEvents="box-none">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
            pointerEvents="auto"
          >
            {DISEASES.map((d) => {
              const isActive = activeFilter === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  activeOpacity={0.82}
                  onPress={() => handleDiseaseChip(d)}
                  style={[
                    styles.chip,
                    { borderColor: d.color },
                    isActive && { backgroundColor: d.color },
                  ]}
                >
                  <View style={[styles.chipDot, { backgroundColor: d.color }, isActive && { backgroundColor: '#fff' }]} />
                  <Text style={[styles.chipText, { color: isActive ? '#fff' : d.color }]}>
                    {d.name}
                  </Text>
                  <View style={[styles.chipBadge, isActive && styles.chipBadgeActive]}>
                    <Text style={[styles.chipBadgeText, isActive && { color: d.color }]}>
                      {d.cases}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Location Banner Popup ── */}
        {showLocationBanner && (
          <Animated.View entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(250)} style={styles.locationBanner}>
            <Ionicons name="location" size={14} color="#fff" />
            <Text style={styles.locationBannerText}>Centered on Barangay 171</Text>
          </Animated.View>
        )}

        {/* ── FAB Controls (bottom-right) ── */}
        <View style={styles.fabStack} pointerEvents="box-none">
          {/* Tile Switcher */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleTileToggle}
            style={[styles.fab, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <Ionicons
              name={mapStyle === 'satellite' ? 'map' : 'globe'}
              size={20}
              color={isDarkMode ? '#38BDF8' : '#176B87'}
            />
          </TouchableOpacity>

          {/* Locate Me */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLocateMe}
            style={[styles.fab, styles.fabPrimary]}
          >
            <Ionicons name="locate" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Native Vector Fallback Overlay (iOS/Android offline) ── */}
        {Platform.OS !== 'web' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* This overlay is invisible on top of WebView by design — */}
            {/* NativePulseMarkers are rendered separately below when WebView fails */}
          </View>
        )}
      </View>

      {/* ── Native fallback markers (shown only when not web) ── */}
      {Platform.OS !== 'web' && (
        <View style={[styles.nativeGrid, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.nativeGridTitle, { color: textPrimary }]}>
            Surveillance Zones
          </Text>
          <View style={styles.nativeMarkerRow}>
            {DISEASES.map((d) => (
              <View key={d.id} style={styles.nativeMarkerItem}>
                <NativePulseMarker color={d.color} onPress={() => handleDiseaseChip(d)} />
                <Text style={[styles.nativeMarkerLabel, { color: textMuted }]} numberOfLines={1}>
                  {d.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Detail Pin Drawer ── */}
      {selectedDisease && (
        <Animated.View
          entering={FadeInRight.duration(320).springify().damping(18)}
          exiting={FadeOutLeft.duration(240)}
          style={[styles.drawer, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
          {/* Header row */}
          <View style={styles.drawerHeader}>
            <View style={[styles.drawerIconBox, { backgroundColor: `${selectedDisease.color}22` }]}>
              <Ionicons name={selectedDisease.iconName} size={22} color={selectedDisease.color} />
            </View>
            <View style={styles.drawerTitleWrap}>
              <Text style={[styles.drawerDiseaseLabel, { color: selectedDisease.color }]}>
                {selectedDisease.name.toUpperCase()} SURVEILLANCE
              </Text>
              <Text style={[styles.drawerTitle, { color: textPrimary }]}>
                Active Monitoring Zone
              </Text>
            </View>
            <TouchableOpacity onPress={handleCloseDrawer} style={styles.drawerClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={textMuted} />
            </TouchableOpacity>
          </View>

          {/* AI Outbreak Probability Score */}
          <View style={[styles.scoreBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: cardBorder }]}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreLabelWrap}>
                <Ionicons name="analytics" size={14} color={isDarkMode ? '#38BDF8' : '#176B87'} />
                <Text style={[styles.scoreLabel, { color: textMuted }]}>
                  AI Outbreak Probability
                </Text>
              </View>
              <Text style={[styles.scoreValue, { color: selectedDisease.color }]}>
                {selectedDisease.probability}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? '#1C2541' : '#E2E8F0' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${selectedDisease.probability}%` as `${number}%`,
                    backgroundColor: selectedDisease.color,
                  },
                ]}
              />
            </View>
            <View style={styles.riskRow}>
              <View style={[styles.riskBadge, { backgroundColor: `${RISK_COLORS[selectedDisease.risk]}22` }]}>
                <View style={[styles.riskDot, { backgroundColor: RISK_COLORS[selectedDisease.risk] }]} />
                <Text style={[styles.riskText, { color: RISK_COLORS[selectedDisease.risk] }]}>
                  {selectedDisease.risk} Risk
                </Text>
              </View>
              <Text style={[styles.casesText, { color: textMuted }]}>
                {selectedDisease.cases} active {selectedDisease.cases === 1 ? 'case' : 'cases'} reported
              </Text>
            </View>
          </View>

          {/* Predictive Insights */}
          <View style={styles.drawerSection}>
            <View style={styles.drawerSectionHeader}>
              <Ionicons name="bulb" size={14} color="#F59E0B" />
              <Text style={[styles.drawerSectionTitle, { color: textPrimary }]}>
                Predictive Insights
              </Text>
            </View>
            <Text style={[styles.drawerSectionBody, { color: textMuted }]}>
              {selectedDisease.insight}
            </Text>
          </View>

          {/* Citizen Action */}
          <View style={[styles.actionBox, { backgroundColor: `${selectedDisease.color}11`, borderColor: `${selectedDisease.color}33` }]}>
            <View style={styles.drawerSectionHeader}>
              <Ionicons name="shield-checkmark" size={14} color={selectedDisease.color} />
              <Text style={[styles.drawerSectionTitle, { color: selectedDisease.color }]}>
                Citizen Action
              </Text>
            </View>
            <Text style={[styles.drawerSectionBody, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
              {selectedDisease.action}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ── Info Header Card ── */}
      {!selectedDisease && (
        <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.infoCardRow}>
            <View style={styles.infoCardLeft}>
              <Text style={[styles.infoCardTitle, { color: textPrimary }]}>
                Public Health Surveillance
              </Text>
              <Text style={[styles.infoCardSubtitle, { color: textMuted }]}>
                Caloocan City · Real-time disease radar · Tap a zone chip for AI analysis
              </Text>
            </View>
            <View style={[styles.infoCardBadge, { backgroundColor: isDarkMode ? '#0F2942' : '#EFF6FF' }]}>
              <Ionicons name="pulse" size={18} color={isDarkMode ? '#38BDF8' : '#176B87'} />
              <Text style={[styles.infoCardBadgeText, { color: isDarkMode ? '#38BDF8' : '#176B87' }]}>
                Live
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Map
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  // Disease Counter Chips
  chipsRow: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipBadge: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  chipBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },
  // Location Banner
  locationBanner: {
    position: 'absolute',
    top: 58,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  locationBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  // FABs
  fabStack: {
    position: 'absolute',
    bottom: 20,
    right: 14,
    gap: 10,
    zIndex: 10,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPrimary: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.45,
  },
  // Native fallback grid
  nativeGrid: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  nativeGridTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  nativeMarkerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nativeMarkerItem: {
    alignItems: 'center',
    gap: 6,
  },
  nativeMarkerLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Detail Drawer
  drawer: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    gap: 14,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitleWrap: {
    flex: 1,
  },
  drawerDiseaseLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  drawerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Score box
  scoreBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  riskDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
  casesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Sections
  drawerSection: {
    gap: 6,
  },
  drawerSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  drawerSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  drawerSectionBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  actionBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  // Info Card
  infoCard: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCardLeft: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  infoCardSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  infoCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  infoCardBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
});

const nativeStyles = StyleSheet.create({
  markerWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  markerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
