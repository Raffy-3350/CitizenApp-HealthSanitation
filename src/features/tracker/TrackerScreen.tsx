import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { styles } from './styles/TrackerScreen.styles';

const CALOOCAN_CENTER = { latitude: 14.6507, longitude: 120.9679 };
const CALOOCAN_BOUNDS = [[14.58, 120.90], [14.82, 121.15]];

const RISK_AREAS = [
  {
    id: 'dengue',
    name: 'Dengue Risk',
    barangay: 'Brgy. 12 (Dagat-Dagatan)',
    district: 'District 2',
    color: '#DC2626',
    latitude: 14.655,
    longitude: 120.973,
    radius: 450,
    status: 'High Alert',
    casesCount: 14,
    description: '14 active infection clusters reported near low-lying creek'
  },
  {
    id: 'leptospirosis',
    name: 'Leptospirosis Risk',
    barangay: 'Brgy. 28 (Maypajo)',
    district: 'District 2',
    color: '#F97316',
    latitude: 14.644,
    longitude: 120.959,
    radius: 380,
    status: 'Moderate',
    casesCount: 6,
    description: '6 floodwater exposure cases post-heavy rainfall'
  },
  {
    id: 'rabies',
    name: 'Rabies Risk',
    barangay: 'Brgy. 171 (Bagumbong)',
    district: 'District 1',
    color: '#EAB308',
    latitude: 14.661,
    longitude: 120.962,
    radius: 320,
    status: 'Monitored',
    casesCount: 3,
    description: '3 reported animal bite surveillance incidents'
  },
  {
    id: 'malaria',
    name: 'Malaria Control',
    barangay: 'Brgy. 176 (Bagong Silang)',
    district: 'District 1',
    color: '#9333EA',
    latitude: 14.638,
    longitude: 120.978,
    radius: 400,
    status: 'Controlled',
    casesCount: 2,
    description: '2 active vector control & spray monitoring dots'
  },
] as const;

function getLeafletMapHtml(userLocation: Location.LocationObject | null, isDarkMode: boolean): string {
  const bounds = JSON.stringify(CALOOCAN_BOUNDS);
  const risks = JSON.stringify(RISK_AREAS).replace(/</g, '\\u003c');
  const tileUrl = isDarkMode
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttr = isDarkMode
    ? '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const user = JSON.stringify(userLocation ? {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
    accuracy: userLocation.coords.accuracy,
  } : null).replace(/</g, '\\u003c');

  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html,body,#map { height:100%; margin:0; padding:0; background:${isDarkMode ? '#0B132B' : '#DDE7EA'}; font-family: system-ui, sans-serif; }
  .leaflet-control-attribution { font-size:9px !important; }
  
  @keyframes case-pulse {
    0%   { transform: scale(0.6); opacity: 0.9; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  .case-dot-container {
    position: relative;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .case-dot-pulse {
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    animation: case-pulse 2.4s infinite ease-out;
    pointer-events: none;
  }
  .case-dot-badge {
    position: relative;
    z-index: 2;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  }
</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const center = [${CALOOCAN_CENTER.latitude}, ${CALOOCAN_CENTER.longitude}];
const caloocanBounds = ${bounds};
const risks = ${risks};
const user = ${user};
const map = L.map('map', { zoomControl: true, minZoom: 12, maxZoom: 18, maxBounds: caloocanBounds, maxBoundsViscosity: 1.0 }).setView(center, 14);
L.tileLayer('${tileUrl}', { maxZoom: 19, attribution: '${tileAttr}' }).addTo(map);

const bounds = [];
risks.forEach((risk) => {
  const point = [risk.latitude, risk.longitude];

  // Coverage circle boundary tailored to Barangay zone
  L.circle(point, {
    radius: risk.radius,
    color: risk.color,
    weight: 2.5,
    opacity: 0.85,
    fillColor: risk.color,
    fillOpacity: 0.16
  }).addTo(map).bindTooltip('<strong>' + risk.name + ' Zone</strong><br>📍 ' + risk.barangay + '<br>Total Cases: ' + risk.casesCount);

  // Generate multiple case dots scattered inside the circle corresponding to case count
  const count = risk.casesCount;
  for (let i = 0; i < count; i++) {
    // Golden angle distribution inside circle radius
    const angle = i * 2.3999632297286533; 
    const rRatio = Math.sqrt((i + 0.5) / count) * 0.72;
    const distanceMeters = risk.radius * rRatio;
    
    // Degree conversion
    const latOffset = (distanceMeters / 111320) * Math.sin(angle);
    const lngOffset = (distanceMeters / (111320 * Math.cos(risk.latitude * Math.PI / 180))) * Math.cos(angle);
    
    const dotLat = risk.latitude + latOffset;
    const dotLng = risk.longitude + lngOffset;

    const caseDotHtml = \`
      <div class="case-dot-container">
        <div class="case-dot-pulse" style="background-color: \${risk.color}"></div>
        <div class="case-dot-badge" style="background-color: \${risk.color}"></div>
      </div>
    \`;

    const caseIcon = L.divIcon({
      className: '',
      html: caseDotHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker([dotLat, dotLng], { icon: caseIcon })
      .addTo(map)
      .bindTooltip('<strong style="color:' + risk.color + '">' + risk.name + ' (Case #' + (i + 1) + ')</strong><br>📍 ' + risk.barangay + '<br><small>Status: Active Surveillance</small>', { direction: 'top', offset: [0, -8] });

    bounds.push([dotLat, dotLng]);
  }
});

if (user) {
  const userPoint = [user.latitude, user.longitude];
  L.circle(userPoint, { radius: user.accuracy || 50, color: '#3B82F6', weight: 1.5, fillColor: '#3B82F6', fillOpacity: 0.15 }).addTo(map);
  const userIcon = L.divIcon({ className: 'user-pin', html: '<svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg"><path d="M17 1C8.2 1 1 8.2 1 17c0 11.7 16 23 16 23s16-11.3 16-23C33 8.2 25.8 1 17 1z" fill="#3B82F6" stroke="white" stroke-width="3"/><circle cx="17" cy="17" r="5" fill="white"/></svg>', iconSize: [34,42], iconAnchor: [17,42] });
  L.marker(userPoint, { icon: userIcon }).addTo(map).bindTooltip('You are here', { direction: 'top', offset: [0, -40] }).bindPopup('Your current location');
  bounds.push(userPoint);
}
if (bounds.length) map.fitBounds(bounds, { padding: [24, 24] });
</script></body></html>`;
}

export function TrackerScreen() {
  const { isDarkMode } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const requestLocation = async () => {
    setIsLoading(true);
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      if (!response.granted) {
        setPermissionDenied(true);
        return;
      }

      setPermissionDenied(false);
      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(currentLocation);
    } catch {
      setPermissionDenied(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const mapHtml = useMemo(() => getLeafletMapHtml(location, isDarkMode), [isDarkMode, location]);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.headerTitle, isDarkMode && styles.textLight]}>Public Health Map</Text>
              <Text style={[styles.headerSubtitle, isDarkMode && styles.textMuted]}>Caloocan barangay disease cases & cluster tracking.</Text>
            </View>
            <View style={styles.locationIcon}><IconSymbol name="map" size={22} color="#176B87" /></View>
          </View>
        </View>

        <View style={[styles.mapCard, isDarkMode && styles.mapCardDark]}>
          {isLoading ? (
            <View style={styles.mapLoading}><ActivityIndicator size="large" color={isDarkMode ? '#38BDF8' : '#176B87'} /><Text style={[styles.mapLoadingText, isDarkMode && styles.textMuted]}>Finding your location...</Text></View>
          ) : Platform.OS === 'web' ? (
            <iframe title="Public health map" srcDoc={mapHtml} style={{ width: '100%', height: '100%', border: 'none' }} />
          ) : (
            <WebView originWhitelist={['*']} source={{ html: mapHtml }} style={styles.map} javaScriptEnabled />
          )}
          <BlurView
            intensity={82}
            tint={isDarkMode ? 'dark' : 'light'}
            style={styles.legendOverlay}
          >
            <Text style={[styles.legendTitle, isDarkMode && styles.textLight]}>Surveillance Case Dots</Text>
            <View style={styles.legendGrid}>
              {RISK_AREAS.map((risk) => (
                <View key={risk.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: risk.color }]} />
                  <Text style={[styles.legendText, isDarkMode && styles.textMuted]}>
                    {risk.name} ({risk.casesCount} dots)
                  </Text>
                </View>
              ))}
            </View>
          </BlurView>
        </View>

        {permissionDenied ? (
          <View style={[styles.permissionCard, isDarkMode && styles.cardDark]}>
            <IconSymbol name="location.fill" size={26} color="#DC2626" />
            <View style={styles.permissionCopy}><Text style={[styles.permissionTitle, isDarkMode && styles.textLight]}>Location access is off</Text><Text style={[styles.permissionText, isDarkMode && styles.textMuted]}>Grant permission to center the map on your area.</Text></View>
            <TouchableOpacity style={styles.permissionButton} onPress={requestLocation} activeOpacity={0.85}><Text style={styles.permissionButtonText}>Grant</Text></TouchableOpacity>
          </View>
        ) : null}

        {/* Risk Status Cards List with Case Counts */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>Barangay Infection Clusters</Text>
        </View>

        <View style={styles.riskGrid}>
          {RISK_AREAS.map((risk) => (
            <View key={risk.id} style={[styles.riskCard, isDarkMode && styles.riskCardDark]}>
              <View style={[styles.circleBadgeWrapper, { backgroundColor: risk.color + '1F' }]}>
                <View style={[styles.circleBadgeInner, { backgroundColor: risk.color }]} />
              </View>
              <View style={styles.riskInfo}>
                <View style={styles.riskHeaderRow}>
                  <Text style={[styles.riskName, isDarkMode && styles.textLight]}>{risk.name}</Text>
                  <View style={[styles.barangayTag, isDarkMode && styles.barangayTagDark]}>
                    <Text style={styles.barangayTagText}>{risk.barangay} • {risk.district}</Text>
                  </View>
                </View>
                <Text style={[styles.riskDetail, isDarkMode && styles.textMuted]}>{risk.description}</Text>
              </View>
              <View style={styles.badgeColumn}>
                <View style={[styles.radiusBadge, isDarkMode && styles.radiusBadgeDark]}>
                  <Text style={[styles.radiusText, { color: risk.color }]}>{risk.status}</Text>
                </View>
                <View style={[styles.casesCountBadge, { backgroundColor: risk.color + '1F', borderColor: risk.color + '4D' }]}>
                  <Text style={[styles.casesCountText, { color: risk.color }]}>{risk.casesCount} Case Dots</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
