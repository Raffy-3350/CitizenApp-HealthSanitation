# Caloocan Citizen Mobile App - Offline Mode Scope & Limitations

**System Architecture Document for Project Clients & Stakeholders**  
**Database Infrastructure**: Supabase PostgreSQL (Cloud Database)  
**Mobile Framework**: React Native (Expo) with Offline-First Local Cache & Outbox Sync Queue  

---

## Executive Summary

The **Caloocan Citizen Health & Sanitation Mobile Application** is designed with an **Offline Resilience Architecture**. Recognizing that citizens in Caloocan City may experience temporary cellular signal loss, power outages during typhoons, or intermittent Wi-Fi connectivity, the application ensures uninterrupted usability through **Local Storage Caching** and an **Offline Outbox Sync Queue**.

When the mobile device loses internet connectivity, the app smoothly transitions to **Offline Mode**, allowing citizens to access previously loaded records, prepare health issue reports, and request sanitation services without application crashes or white blank screens.

---

## 1. Scope of Capabilities (What Works Offline)

### 1.1 Local Data Caching (Read Access)
The following records are cached on the citizen's local device storage and remain fully readable offline:
- **Appointments & Schedules**: Previously booked medical checkups, dental appointments, and health center visits.
- **Sanitation Permits**: Filed business health permits, sanitation clearance statuses, and inspection notices.
- **Health Records & Vaccines**: Immunization history, booster schedules, and family member health records.
- **Disease Advisories & Alerts**: Saved community health warnings, Barangay misting schedules, and dengue outbreak notices.
- **Cached Disease Map & Hazards**: Saved Caloocan disease surveillance hazard zones and local health center coordinates.

### 1.2 Offline Outbox Sync Queue (Write Access)
Citizens can continue performing core actions while disconnected from the internet:
- **Offline Health Incident Reporting**: Citizens can fill out Dengue breeding site reports, stagnant water complaints, or garbage dumping issues. The app saves the report locally in an **Offline Outbox Queue**.
- **Offline Sanitation Service Bookings**: Homeowners can submit requests for septic tank desludging or grease trap cleaning while offline.
- **Automatic Background Re-Sync**: As soon as the device reconnects to the internet/cellular data, the app automatically flushes the local outbox and inserts the pending reports directly into Supabase cloud database tables.

### 1.3 User Experience & Transparency
- **Non-Intrusive Offline Banner**: Displays `📡 Offline Mode • Viewing Local Cache` at the top of the screen.
- **Pending Sync Counter**: Informs citizens how many submitted items are stored locally awaiting internet connection (e.g. `1 Report Pending Auto-Sync`).

---

## 2. Technical Limitations (What Requires Online Connection)

Because Supabase is a cloud-based relational database server, certain features inherently require active internet access:

| Feature / Action | Offline Behavior | Reason / Technical Limitation |
| :--- | :--- | :--- |
| **Initial App Installation & Login** | Required Online | Authentication against Supabase Auth (`supabase.auth`) requires initial network connection to verify JWT security tokens. |
| **Live Map Tile Satellite Streaming** | Uses Cached/Vector Map | High-resolution satellite map tiles from external tile servers (Esri / CartoDB) require network streaming. If offline, the app displays vector grid boundaries and cached pin locations. |
| **High-Res Photo & Document Uploads** | Queued Locally | Binary media files (e.g. photo of stagnant water) are stored on local storage until reconnected, after which they are uploaded to Supabase Storage Buckets. |
| **Instant Supabase Realtime Webhooks** | Delayed until Reconnect | Real-time push notifications from City Health Officers will resume automatically when internet connectivity is restored. |

---

## 3. Data Integrity & Security Safeguards

1. **Transaction Safety**: Every offline item is assigned a client-generated UUID (`id: CS-OFFLINE-xxxx`) to prevent duplicate entry creation upon cloud synchronization.
2. **Local Encryption**: Sensitive user profile details cached on the device are secured via device OS storage encryption standards.
3. **Graceful Conflict Resolution**: If a citizen updates an appointment status while offline, the Cloud timestamp from Supabase takes precedence upon sync.

---

*Document prepared for Caloocan Citizen Health & Sanitation System Management Team.*
