import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { AlertItem, useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MapPin {
  id: string;
  title: string;
  barangay: string;
  type: 'dengue' | 'leptospirosis' | 'rabies' | 'malaria';
  severity: 'high' | 'medium' | 'normal';
  x: number;
  y: number;
  aiRiskScore: number;
  predictiveInsight: string;
  citizenAction: string;
  status: string;
  icon: string;
  color: string;
  casesCount: number;
}

const surveillanceMapPins: MapPin[] = [
  {
    id: 'pin-dengue',
    title: 'Dengue Outbreak Surveillance Zone',
    barangay: 'Barangay 12 (Grace Park, Caloocan)',
    type: 'dengue',
    severity: 'high',
    x: 34,
    y: 30,
    aiRiskScore: 88,
    predictiveInsight: 'Predictive ML Model flags 88/100 outbreak probability due to 14 stagnant water reports post-monsoon rain.',
    citizenAction: 'Empty standing water containers. Caloocan Health fogging crew scheduled for 4:00 PM today.',
    status: '14 LISTED CASES • OUTBREAK WARNING',
    icon: 'warning',
    color: '#EF4444',
    casesCount: 14,
  },
  {
    id: 'pin-lepto',
    title: 'Leptospirosis Risk Area',
    barangay: 'Barangay 8 (Caloocan South)',
    type: 'leptospirosis',
    severity: 'high',
    x: 68,
    y: 44,
    aiRiskScore: 76,
    predictiveInsight: 'Floodwater run-off risk alert: 6 listed cases reported near low-lying flood channels.',
    citizenAction: 'Avoid wading in floodwaters. Doxycycline prophylaxis available at Caloocan Health Center.',
    status: '6 LISTED CASES • FLOOD RISK',
    icon: 'water',
    color: '#F97316',
    casesCount: 6,
  },
  {
    id: 'pin-rabies',
    title: 'Rabies Animal Bite Surveillance',
    barangay: 'Barangay 20 (Caloocan South)',
    type: 'rabies',
    severity: 'medium',
    x: 24,
    y: 72,
    aiRiskScore: 52,
    predictiveInsight: 'Stray animal rabies bite alert: 4 canine bite incidents recorded this week.',
    citizenAction: 'Keep pets vaccinated. Report stray animals to Caloocan Veterinary Office. Wash bites immediately.',
    status: '4 LISTED CASES • ANIMAL BITE RISK',
    icon: 'paw',
    color: '#EAB308',
    casesCount: 4,
  },
  {
    id: 'pin-malaria',
    title: 'Malaria Vector Control Station',
    barangay: 'Barangay 5 (Caloocan South)',
    type: 'malaria',
    severity: 'medium',
    x: 58,
    y: 65,
    aiRiskScore: 40,
    predictiveInsight: 'Anopheles mosquito vector breeding trap alert: 2 cases flagged near boundary zone.',
    citizenAction: 'Use mosquito nets and insect repellent during nighttime hours.',
    status: '2 LISTED CASES • VECTOR CONTROL',
    icon: 'shield',
    color: '#A855F7',
    casesCount: 2,
  },
];

const getLeafletMapHtml = (style: 'standard' | 'satellite', isFocusedOnUserBarangay: boolean = false) => {
  const tileUrl = style === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';

  const attribution = style === 'satellite'
    ? '&copy; Esri World Imagery'
    : '&copy; OpenStreetMap &copy; CARTO';

  const centerLat = isFocusedOnUserBarangay ? 14.6538 : 14.6507;
  const centerLng = isFocusedOnUserBarangay ? 120.9822 : 120.9830;
  const initialZoom = isFocusedOnUserBarangay ? 16 : 13;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #0e2e42; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-control-attribution { font-size: 9px !important; opacity: 0.8; background: rgba(255,255,255,0.7) !important; padding: 2px 6px !important; }
    .custom-marker {
      width: 32px; height: 32px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 13px; box-shadow: 0 3px 8px rgba(0,0,0,0.4); border: 2px solid white;
      transition: transform 0.2s ease;
    }
    .custom-marker:hover { transform: scale(1.25); }
    .red-pin-container {
      position: relative; width: 28px; height: 34px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
    }
    .red-aura-pulse {
      position: absolute; top: 0px; left: -4px; width: 36px; height: 36px; border-radius: 18px; border: 2.5px solid #EF4444; animation: pulse 1.4s infinite; opacity: 0.85; pointer-events: none;
    }
    @keyframes pulse {
      0% { transform: scale(0.7); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .leaflet-tooltip { font-family: sans-serif; font-size: 11.5px; font-weight: 700; border-radius: 8px; border: none; padding: 6px 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.3); }
    .leaflet-popup-content-wrapper { border-radius: 12px; font-family: sans-serif; padding: 4px; }
    .leaflet-popup-content { margin: 8px 12px; line-height: 1.4; font-size: 12px; }
    .popup-title { font-weight: 800; font-size: 14px; color: #0d4f64; margin-bottom: 2px; }
    .popup-status { font-size: 10px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true, minZoom: 12, maxZoom: 18 }).setView([${centerLat}, ${centerLng}], ${initialZoom});
    
    // Restrict zoom and pan strictly to Caloocan City Boundaries
    var caloocanBounds = L.latLngBounds([[14.58, 120.90], [14.82, 121.15]]);
    map.setMaxBounds(caloocanBounds);

    L.tileLayer('${tileUrl}', { attribution: '${attribution}', maxZoom: 18, minZoom: 12 }).addTo(map);

    // SVG Red Location Pin Dot for Current Location (Grace Park, Caloocan South)
    var userLat = 14.6538;
    var userLng = 120.9822;
    var redUserIcon = L.divIcon({
      className: 'user-pin-wrap',
      html: '<div class="red-pin-container"><svg width="28" height="34" viewBox="0 0 24 30"><path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12zm0 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="#EF4444" stroke="#ffffff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.5" fill="#ffffff"/></svg><div class="red-aura-pulse"></div></div>',
      iconSize: [28, 34],
      iconAnchor: [14, 34]
    });
    var userMarker = L.marker([userLat, userLng], { icon: redUserIcon }).addTo(map);
    userMarker.bindTooltip("<b>CURRENT LOCATION</b><br>Barangay 12 (Grace Park, Caloocan South)", { permanent: false, direction: 'top' });
    userMarker.bindPopup("<b>CURRENT LOCATION</b><br>Barangay 12 (Grace Park, Caloocan South)<br><span style='color:#F97316;font-weight:700;'>150m from Leptospirosis Risk Area</span>");
    ${isFocusedOnUserBarangay ? `
      userMarker.openPopup();
      setTimeout(function() {
        userMarker.closePopup();
      }, 2500);
    ` : ''}

    // Caloocan City Target Disease Spatial Range Radars (Clean Text-Free Circles)
    var radars = [
      { lat: 14.6590, lng: 120.9780, title: 'Dengue Outbreak Surveillance Zone', color: '#EF4444', status: '14 LISTED CASES • OUTBREAK WARNING', radius: 420, casesInfo: '14 Dengue Cases Listed (Brgy 12, Grace Park)' },
      { lat: 14.6480, lng: 120.9890, title: 'Leptospirosis Flood Risk Area', color: '#F97316', status: '6 LISTED CASES • FLOOD RISK', radius: 340, casesInfo: '6 Leptospirosis Cases Listed (Brgy 8, Caloocan South)' },
      { lat: 14.6560, lng: 120.9840, title: 'Rabies Animal Bite Surveillance', color: '#EAB308', status: '4 LISTED CASES • ANIMAL BITE RISK', radius: 280, casesInfo: '4 Rabies Cases Listed (Brgy 20, Caloocan South)' },
      { lat: 14.6440, lng: 120.9760, title: 'Malaria Vector Control Station', color: '#A855F7', status: '2 LISTED CASES • VECTOR CONTROL', radius: 240, casesInfo: '2 Malaria Cases Listed (Brgy 5, Caloocan South)' }
    ];

    radars.forEach(function(r) {
      var circle = L.circle([r.lat, r.lng], {
        color: r.color,
        fillColor: r.color,
        fillOpacity: 0.35,
        weight: 2,
        radius: r.radius
      }).addTo(map);

      circle.bindTooltip("<b>" + r.title + "</b><br>" + r.casesInfo, { permanent: false, direction: 'top' });
      circle.bindPopup("<div class='popup-status' style='color:" + r.color + "'>" + r.status + "</div><div class='popup-title'>" + r.title + "</div><b>" + r.casesInfo + "</b><br>Tap view action details in app.");
    });
  </script>
</body>
</html>
  `;
};

export default function AlertsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { alerts, markAlertRead, markAllAlertsRead } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'health'>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [isFocusedOnBarangay, setIsFocusedOnBarangay] = useState(false);
  const [locateKey, setLocateKey] = useState(0);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granting' | 'granted' | 'denied'>('prompt');
  const [userGpsLocation, setUserGpsLocation] = useState<{ barangay: string; x: number; y: number } | null>(null);

  const requestLocation = async () => {
    setLocationStatus('granting');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationStatus('granted');
        setUserGpsLocation({
          barangay: 'Barangay 12 (Grace Park, Caloocan South)',
          x: 48,
          y: 52,
        });
      } else {
        setLocationStatus('denied');
      }
    } catch {
      setLocationStatus('granted');
      setUserGpsLocation({
        barangay: 'Barangay 12 (Grace Park, Caloocan South)',
        x: 48,
        y: 52,
      });
    }
  };

  const handleLocateMe = async () => {
    await requestLocation();
    setIsFocusedOnBarangay(true);
    setLocateKey((prev) => prev + 1);
  };

  // Automatically request GPS location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const filteredAlerts = alerts.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'health') return item.type.toLowerCase().includes('health') || item.type.toLowerCase().includes('dengue');
    return true;
  });

  const changeFilter = (filter: 'all' | 'unread' | 'health') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveFilter(filter);
  };

  const handleMarkAllRead = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    markAllAlertsRead();
  };

  const handleAlertPress = (alertItem: AlertItem) => {
    markAlertRead(alertItem.id);
    setSelectedAlert(alertItem);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.isoBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
            <Text style={[styles.isoBadgeText, { color: colors.primary }]}>HEALTH CASES MAP</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Health Cases Alerts</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Real-time disease cases & health advisories</Text>
        </View>

        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {/* Dual View Segmented Switcher (List View vs Map Surveillance) */}
      <View style={[styles.viewToggleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === 'list' && { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setViewMode('list');
          }}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={viewMode === 'list' ? '#ffffff' : colors.text}
          />
          <Text
            style={[
              styles.toggleBtnText,
              { color: viewMode === 'list' ? '#ffffff' : colors.text },
            ]}
          >
            Notifications ({alerts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === 'map' && { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setViewMode('map');
          }}
        >
          <Ionicons
            name="map-outline"
            size={16}
            color={viewMode === 'map' ? '#ffffff' : colors.text}
          />
          <Text
            style={[
              styles.toggleBtnText,
              { color: viewMode === 'map' ? '#ffffff' : colors.text },
            ]}
          >
            Health Cases Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── MODE 1: NOTIFICATIONS LIST VIEW ─── */}
      {viewMode === 'list' && (
        <>
          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {[
              { key: 'all', label: `All (${alerts.length})` },
              { key: 'unread', label: `Unread (${unreadCount})` },
              { key: 'health', label: 'Health Notices' },
            ].map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.card,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => changeFilter(filter.key as any)}
                >
                  <Text style={[styles.chipText, { color: isActive ? '#ffffff' : colors.text }]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {filteredAlerts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.subtext} />
                <Text style={[styles.emptyText, { color: colors.subtext }]}>No alerts in this category</Text>
              </View>
            ) : (
              filteredAlerts.map((alert, index) => (
                <Animated.View key={alert.id} entering={FadeInDown.delay(index * 60).springify()}>
                  <TouchableOpacity
                    style={[
                      styles.alertCard,
                      { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                      !alert.read && { borderLeftWidth: 4, borderLeftColor: colors.primary },
                    ]}
                    onPress={() => handleAlertPress(alert)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.alertIcon, { backgroundColor: alert.color + '20' }]}>
                      <Ionicons name={alert.icon as any} size={22} color={alert.color} />
                    </View>
                    <View style={styles.alertContent}>
                      <View style={styles.alertTop}>
                        <Text style={[styles.alertType, { color: colors.text }]}>{alert.type}</Text>
                        <Text style={[styles.alertTime, { color: colors.subtext }]}>{alert.time}</Text>
                      </View>
                      <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
                      <Text style={[styles.alertMessage, { color: colors.subtext }]} numberOfLines={2}>
                        {alert.message}
                      </Text>
                    </View>
                    {!alert.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}

            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.markAllButton, { backgroundColor: colors.primaryLight }]}
                onPress={handleMarkAllRead}
              >
                <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 30 }} />
          </ScrollView>
        </>
      )}

      {/* ─── MODE 2: REALISTIC GOOGLE MAPS / LEAFLET SPATIAL SURVEILLANCE ─── */}
      {viewMode === 'map' && (
        <View style={styles.fullMapWrapper}>
          {/* Main Full-Height Interactive Map Canvas (Leaflet / Google Maps Style) */}
          <View
            style={[
              styles.leafletMapCanvas,
              {
                backgroundColor: mapStyle === 'satellite' ? '#091c28' : '#0f384c',
                borderColor: colors.border,
              },
            ]}
          >
            {/* Top Floating Target Disease Surveillance Counter Bar */}
            <View style={[styles.floatingDiseaseCounterBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.diseaseCounterChip}
                activeOpacity={0.8}
                onPress={() => setSelectedPin(surveillanceMapPins[0])}
              >
                <View style={[styles.counterDot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.counterText, { color: colors.text }]}>
                  <Text style={{ fontWeight: '800', color: '#EF4444' }}>Dengue:</Text> 14
                </Text>
              </TouchableOpacity>

              <View style={[styles.counterDivider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.diseaseCounterChip}
                activeOpacity={0.8}
                onPress={() => setSelectedPin(surveillanceMapPins[1])}
              >
                <View style={[styles.counterDot, { backgroundColor: '#F97316' }]} />
                <Text style={[styles.counterText, { color: colors.text }]}>
                  <Text style={{ fontWeight: '800', color: '#F97316' }}>Lepto:</Text> 6
                </Text>
              </TouchableOpacity>

              <View style={[styles.counterDivider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.diseaseCounterChip}
                activeOpacity={0.8}
                onPress={() => setSelectedPin(surveillanceMapPins[2])}
              >
                <View style={[styles.counterDot, { backgroundColor: '#EAB308' }]} />
                <Text style={[styles.counterText, { color: colors.text }]}>
                  <Text style={{ fontWeight: '800', color: '#EAB308' }}>Rabies:</Text> 4
                </Text>
              </TouchableOpacity>

              <View style={[styles.counterDivider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.diseaseCounterChip}
                activeOpacity={0.8}
                onPress={() => setSelectedPin(surveillanceMapPins[3])}
              >
                <View style={[styles.counterDot, { backgroundColor: '#A855F7' }]} />
                <Text style={[styles.counterText, { color: colors.text }]}>
                  <Text style={{ fontWeight: '800', color: '#A855F7' }}>Malaria:</Text> 2
                </Text>
              </TouchableOpacity>
            </View>

            {/* Real Interactive Leaflet Tile Map Canvas (CartoDB Voyager / Esri Satellite Tiles) */}
            {Platform.OS === 'web' ? (
              <iframe
                key={`map-frame-${mapStyle}-${isFocusedOnBarangay}-${locateKey}`}
                srcDoc={getLeafletMapHtml(mapStyle, isFocusedOnBarangay)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: 20,
                }}
              />
            ) : (
              <>
                {/* Fallback Vector Map Canvas for Native Mobile (Clean Clutter-Free) */}
                <View style={styles.leafletGridLines} />
                <View style={styles.riverOverlayLine} />
                <View style={styles.mainAvenueLine} />
                <View style={styles.crossAvenueLine} />

                <View style={[styles.heatZoneCircle, { left: '24%', top: '26%' }]} />

                {userGpsLocation && (
                  <View style={[styles.leafletUserPin, { left: `${userGpsLocation.x}%`, top: `${userGpsLocation.y}%` }]}>
                    <Ionicons name="person" size={12} color="#ffffff" />
                    <View style={styles.userAuraPulse} />
                  </View>
                )}

                {surveillanceMapPins.map((pin) => (
                  <TouchableOpacity
                    key={pin.id}
                    style={[
                      styles.leafletMapPin,
                      { left: `${pin.x}%`, top: `${pin.y}%`, backgroundColor: pin.color },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPin(pin)}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 12 }}>{pin.casesCount}</Text>
                    {pin.severity === 'high' && <View style={styles.pinPulseRing} />}
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Google Maps Style Floating FAB Controls (Bottom Right) */}
            <View style={styles.leafletFabControls}>
              <TouchableOpacity
                style={[styles.leafletFabBtn, { backgroundColor: colors.card }]}
                onPress={handleLocateMe}
              >
                <Ionicons name="locate-sharp" size={20} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.leafletFabBtn, { backgroundColor: colors.card }]}
                onPress={() => setMapStyle(mapStyle === 'standard' ? 'satellite' : 'standard')}
              >
                <Ionicons
                  name={mapStyle === 'standard' ? 'earth' : 'map'}
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Compact Floating Map Legend (Bottom Left) */}
            <View style={[styles.floatingMiniLegend, { backgroundColor: colors.card + 'E6' }]}>
              <View style={styles.miniLegendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.miniLegendText, { color: colors.text }]}>Dengue Risk</Text>
              </View>
              <View style={styles.miniLegendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                <Text style={[styles.miniLegendText, { color: colors.text }]}>Leptospirosis Risk</Text>
              </View>
              <View style={styles.miniLegendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
                <Text style={[styles.miniLegendText, { color: colors.text }]}>Rabies Risk</Text>
              </View>
              <View style={styles.miniLegendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
                <Text style={[styles.miniLegendText, { color: colors.text }]}>Malaria Control</Text>
              </View>
            </View>

            {/* Compact Floating Pin Drawer / Callout Card */}
            {selectedPin && (
              <Animated.View
                entering={FadeInRight.duration(240).springify()}
                exiting={FadeOutLeft.duration(180)}
                style={[styles.floatingPinDrawer, { backgroundColor: colors.card, borderColor: selectedPin.color }]}
              >
                <View style={styles.drawerHeader}>
                  <View style={styles.drawerHeaderLeft}>
                    <View style={[styles.drawerIconBox, { backgroundColor: selectedPin.color + '18' }]}>
                      <Ionicons name={selectedPin.icon as any} size={18} color={selectedPin.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.drawerTagText, { color: selectedPin.color }]}>{selectedPin.status}</Text>
                      <Text style={[styles.drawerTitleText, { color: colors.text }]} numberOfLines={1}>
                        {selectedPin.title}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedPin(null)}>
                    <Ionicons name="close-circle-outline" size={22} color={colors.subtext} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.drawerBarangayText, { color: colors.subtext }]}>{selectedPin.barangay}</Text>

                <View style={styles.drawerFooterRow}>
                  <Text style={[styles.drawerRiskText, { color: selectedPin.color }]}>
                    AI RISK SCORE: {selectedPin.aiRiskScore}/100
                  </Text>
                  <TouchableOpacity
                    style={[styles.drawerActionBtn, { backgroundColor: selectedPin.color }]}
                    onPress={() => {
                      if (selectedPin.type === 'dengue' || selectedPin.type === 'leptospirosis') {
                        router.push('/(tabs)/report-issue' as any);
                      } else {
                        router.push('/(tabs)/services' as any);
                      }
                    }}
                  >
                    <Text style={styles.drawerActionText}>View Details & Action</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      )}

      {/* ─── MODAL 1: Alert Detail Modal ─── */}
      <Modal visible={!!selectedAlert} animationType="slide" transparent onRequestClose={() => setSelectedAlert(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedAlert && (
              <>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.alertIcon, { backgroundColor: selectedAlert.color + '20' }]}>
                      <Ionicons name={selectedAlert.icon as any} size={22} color={selectedAlert.color} />
                    </View>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedAlert.type}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAlert(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedAlert.title}</Text>
                <Text style={[styles.detailTime, { color: colors.subtext }]}>{selectedAlert.time}</Text>

                <View style={[styles.detailMessageBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.detailMessageText, { color: colors.text }]}>{selectedAlert.message}</Text>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setSelectedAlert(null);
                      router.push('/(tabs)/track-requests' as any);
                    }}
                  >
                    <Text style={styles.modalActionBtnText}>Track Requests</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: colors.subtext }]}
                    onPress={() => setSelectedAlert(null)}
                  >
                    <Text style={styles.modalActionBtnText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 2: Interactive Surveillance Pin DSS Modal ─── */}
      <Modal visible={!!selectedPin} animationType="slide" transparent onRequestClose={() => setSelectedPin(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedPin && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={[styles.alertIcon, { backgroundColor: selectedPin.color + '20' }]}>
                      <Ionicons name={selectedPin.icon as any} size={22} color={selectedPin.color} />
                    </View>
                    <View>
                      <Text style={[styles.pinCategoryText, { color: selectedPin.color }]}>{selectedPin.status}</Text>
                      <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>{selectedPin.title}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedPin(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.pinBarangaySubtitle, { color: colors.subtext }]}>{selectedPin.barangay}</Text>

                {/* Decision Support & Predictive AI Box */}
                <View style={[styles.dssAiBox, { backgroundColor: selectedPin.color + '12', borderColor: selectedPin.color }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Ionicons name="pulse" size={16} color={selectedPin.color} />
                    <Text style={[styles.dssAiTitle, { color: selectedPin.color }]}>DECISION SUPPORT & PREDICTIVE ANALYTICS</Text>
                  </View>
                  <Text style={[styles.dssAiText, { color: colors.text }]}>{selectedPin.predictiveInsight}</Text>
                </View>

                {/* Citizen Action Steps */}
                <View style={[styles.actionStepBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                    <Text style={[styles.actionStepTitle, { color: colors.primary }]}>RECOMMENDED CITIZEN ACTION</Text>
                  </View>
                  <Text style={[styles.actionStepText, { color: colors.text }]}>{selectedPin.citizenAction}</Text>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: selectedPin.color }]}
                    onPress={() => {
                      setSelectedPin(null);
                      if (selectedPin.type === 'dengue' || selectedPin.type === 'leptospirosis') {
                        router.push('/(tabs)/report-issue' as any);
                      } else {
                        router.push('/(tabs)/services' as any);
                      }
                    }}
                  >
                    <Text style={styles.modalActionBtnText}>Take Action</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: colors.subtext }]}
                    onPress={() => setSelectedPin(null)}
                  >
                    <Text style={styles.modalActionBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  fullMapWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  leafletMapCanvas: {
    flex: 1,
    minHeight: 480,
    borderRadius: 20,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  floatingDiseaseCounterBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  diseaseCounterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  counterText: {
    ...Typography.caption,
    fontSize: 11.5,
  },
  counterDivider: {
    width: 1,
    height: 14,
    marginHorizontal: 8,
  },
  activeGpsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669',
  },
  gpsEnableIcon: {
    padding: 4,
  },
  leafletGridLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderStyle: 'dashed',
  },
  riverOverlayLine: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#38BDF820',
    transform: [{ rotate: '-8deg' }],
  },
  mainAvenueLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '46%',
    width: 10,
    backgroundColor: '#ffffff12',
  },
  crossAvenueLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '55%',
    height: 10,
    backgroundColor: '#ffffff12',
  },
  leafletRegionTag: {
    position: 'absolute',
    ...Typography.caption,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38BDF8A0',
    letterSpacing: 1.2,
  },
  leafletUserPin: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0284C7',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -13,
    marginTop: -13,
    zIndex: 14,
  },
  userAuraPulse: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#0284C7',
    opacity: 0.6,
  },
  userCalloutTag: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  userCalloutText: {
    ...Typography.caption,
    fontSize: 8.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  leafletMapPin: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -17,
    marginTop: -17,
    elevation: 6,
    zIndex: 12,
  },
  onMapPinPill: {
    position: 'absolute',
    bottom: 38,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: 130,
  },
  onMapPinPillText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
  },
  leafletFabControls: {
    position: 'absolute',
    bottom: 20,
    right: 14,
    zIndex: 20,
    gap: 10,
  },
  leafletFabBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  floatingMiniLegend: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    zIndex: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    elevation: 3,
  },
  miniLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniLegendText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  floatingPinDrawer: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    zIndex: 30,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  drawerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTagText: {
    ...Typography.caption,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  drawerTitleText: {
    ...Typography.subheading,
    fontSize: 15,
    fontWeight: '700',
  },
  drawerBarangayText: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: 10,
  },
  drawerFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  drawerRiskText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
  },
  drawerActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  drawerActionText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  isoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#176B8715',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  isoBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    padding: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  toggleBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 12.5,
  },
  mapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  mapBannerText: {
    ...Typography.caption,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  mapCanvas: {
    height: 240,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  mapGridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderStyle: 'dashed',
  },
  mapRegionLabel: {
    position: 'absolute',
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF880',
    letterSpacing: 1,
  },
  heatZoneCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EF444435',
    borderWidth: 1.5,
    borderColor: '#EF444480',
  },
  mapPin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -16,
    marginTop: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#EF4444',
    opacity: 0.6,
  },
  legendBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...Typography.caption,
    fontSize: 10.5,
    fontWeight: '600',
  },
  dssTitle: {
    ...Typography.subheading,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  pinSummaryCard: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  pinSummaryCategory: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pinRiskBadge: {
    ...Typography.caption,
    fontSize: 9.5,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinSummaryTitle: {
    ...Typography.subheading,
    fontSize: 14,
    fontWeight: '700',
  },
  pinSummaryBarangay: {
    ...Typography.caption,
    fontSize: 11.5,
    marginTop: 2,
  },
  pinCategoryText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pinBarangaySubtitle: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  dssAiBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  dssAiTitle: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dssAiText: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  actionStepBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  actionStepTitle: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionStepText: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Typography.heading,
    color: '#0d4f64',
  },
  subtitle: {
    ...Typography.small,
    color: '#86B6F6',
  },
  unreadBadge: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  unreadText: {
    ...Typography.small,
    color: '#ffffff',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  chipActive: {
    backgroundColor: '#176B87',
    borderColor: '#176B87',
  },
  chipText: {
    ...Typography.small,
    color: '#0d4f64',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  alertUnread: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 3,
    borderLeftColor: '#176B87',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertType: {
    ...Typography.caption,
    fontWeight: '600',
    color: '#0d4f64',
  },
  alertTime: {
    ...Typography.small,
    color: '#86B6F6',
  },
  alertTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
    marginTop: 2,
  },
  alertMessage: {
    ...Typography.small,
    color: '#86B6F6',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#176B87',
    marginLeft: Spacing.sm,
    marginTop: 4,
  },
  markAllButton: {
    backgroundColor: '#B4D4FF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  markAllText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    ...Typography.body,
    color: '#86B6F6',
    marginTop: Spacing.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 79, 100, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    ...Typography.heading,
    color: '#0d4f64',
    fontSize: 18,
  },
  detailTitle: {
    ...Typography.heading,
    color: '#0d4f64',
    fontSize: 18,
    marginTop: Spacing.xs,
  },
  detailTime: {
    ...Typography.small,
    color: '#86B6F6',
    marginBottom: Spacing.md,
  },
  detailMessageBox: {
    backgroundColor: '#EEF5FF50',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  detailMessageText: {
    ...Typography.body,
    color: '#0d4f64',
    lineHeight: 22,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  modalActionBtn: {
    flex: 1,
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalActionBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },
});