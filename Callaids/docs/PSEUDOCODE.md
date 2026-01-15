# TransitPro Driver App Pseudocode

This document outlines the high-level logic and structure of the TransitPro application.

## 1. Core Application & State Management

### 1.1. `TripContext` (Global State in `src/app/(app)/layout.tsx`)

This context provides shared state to all main application pages.

- **STATE VARIABLES:**
  - `tripStatus`: Manages the current state of the trip ("Not Started", "In Progress", "Ended").
  - `selectedStops`: An array of `Stop` objects selected by the driver for the current route.
  - `checklist`: An array of safety check items (`{id, label, checked}`).
  - `diagnostics`: An object tracking system statuses (`{gps, network, qrScanner, aiService}`).
  - `spotifyCredentials`: An object holding Spotify API keys (`{clientId, clientSecret, ...}`).
  - `passengerCount` & `seatCapacity`: Manages passenger load.
  - `routeStops`: A memoized and sorted version of `selectedStops`, ordered by proximity to the bus's current location, with the destination last.
  - `isChecklistComplete`: A derived boolean, true if all checklist items are checked.
  - `areDiagnosticsComplete`: A derived boolean, true if all diagnostic checks pass.

- **FUNCTIONS:**
  - `setTripStatus`, `setSelectedStops`, `setChecklist`, `setDiagnostics`, `setSpotifyCredentials`, `setPassengerCount`.

## 2. Authentication Flow

### 2.1. Login Page (`src/app/page.tsx`)

- **FUNCTION** `onSubmit` in `login-form`:
  - Validates a 6-digit PIN.
  - ON SUCCESS: Navigates to `/dashboard`.
  - ON FAILURE: Shows an error toast.

### 2.2. Signup Page (`src/app/signup/page.tsx`)

- **FUNCTION** `onVerifyCode` in `signup-form`:
  - **Step 1:** Verifies an enrollment code, email, and password.
  - ON SUCCESS: Fetches mock driver and vehicle data, proceeds to Step 2.
  - ON FAILURE: Displays an "invalid code" error.
  - **Step 2:** Displays confirmed driver and vehicle data.
  - **FUNCTION** `handleConfirm`:
    - Simulates account creation.
    - Navigates to `/dashboard`.

## 3. Main Application Pages (`src/app/(app)/`)

### 3.1. Dashboard (`/dashboard`)

- **Initializes:** Fetches `tripStatus`, stops, checklist, and diagnostic status from `TripContext`.
- **UI:**
  - Displays key metrics (Passenger Load, Earnings, Next Stop ETA) in `Card` components.
  - Contains `TripControls` component to start/end trips.
    - The "Start Trip" button is **disabled** unless `isChecklistComplete`, `areDiagnosticsComplete`, and at least one stop is selected.
  - Shows `StopsManagement` component to select stops and set fares.
  - Displays `Current Route Details` card, which is populated only when a trip is "In Progress".

### 3.2. Trip Page (`/trip`)

- **UI:**
  - Displays a `LiveMap` component. If the Google Maps API key is missing, it shows an alert.
  - Overlays passenger count on the map.
  - Contains a "Boarding Alerts" card that is only visible if `tripStatus` is "In Progress".
  - Includes `TrafficSuggestions` component.
    - **FUNCTION** `handleGetSuggestion`:
      - Calls the `getTrafficAwareRouteSuggestions` AI flow.
      - Displays the AI-generated route, time, and reasoning.
      - Button is disabled if the trip is not active.

### 3.3. Boarding Page (`/boarding`)

- **Initializes:**
  - Requests camera permissions on mount.
  - If permission is denied, displays an error and disables the scanner.
- **UI:**
  - Shows a video feed for scanning.
  - "Start Scan" button simulates a QR code scan.
    - **70% chance of success:** Populates fields with valid passenger data.
    - **30% chance of failure:** Populates fields with "Invalid Ticket" data.
  - Displays scanned passenger details (name, destination, status).
  - "Confirm Boarding" button is enabled only for valid tickets.
  - "Manually Add Passenger" button opens a dialog with a form to add a passenger without scanning.

### 3.4. Earnings Page (`/earnings`)

- **Initializes:** Simulates fetching summary metrics and trip logs with a 1-second delay.
- **UI:**
  - Displays summary cards for Today's Earnings, Passengers Served, etc.
  - Shows a `EarningsChart` (Recharts) with mock data for the last 7 days.
  - Lists individual trip logs with earnings for the day.

### 3.5. Bus DJ Page (`/bus-dj`)

- **Logic:** Checks `TripContext` for Spotify credentials.
  - **IF credentials exist:**
    - Displays the full music player UI (play/pause, volume, progress).
    - "View Playlist" button is enabled.
    - **FUNCTION `onClick(View Playlist)`**: Opens a dialog showing the passenger-added song queue.
  - **IF credentials DO NOT exist:**
    - Hides the player.
    - Displays a message prompting the user to add credentials on the Support page, with a direct link.

### 3.6. Support & Safety Page (`/support`)

- **UI:**
  - **Emergency Contact:** A button to contact the control center.
  - **Spotify Credentials:** Input fields for Client ID, Client Secret, Redirect URI, and Player Name.
    - **FUNCTION `handleSaveApiKeys`**: Saves the entered credentials into the global `TripContext`.
  - **Safety Checklist:** A list of pre-trip checks with checkboxes. State is saved in `TripContext`.
  - **System Diagnostics:**
    - **FUNCTION `runDiagnostics`**:
      - Sequentially runs checks for GPS, Network, QR Scanner (Camera), and the AI Service.
      - Updates the UI with the status of each check (Pending, Checking, Success, Error).
      - Plays a beeping sound upon completion.
    - If a check fails, clicking it opens a dialog with error details and a "Retry" button.

### 3.7. Profile Page (`/profile`)

- **UI:** A static page that displays mock driver and vehicle information, such as name, license number, bus model, and license plate.
