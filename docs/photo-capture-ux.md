# In-App Photo Capture -- UX Specification

**Status:** In progress
**Last updated:** 24 March 2026
**Contributors:** Design team

---

## 1. Purpose

Phlo Clinic requires patients ordering weight-loss treatments (e.g. Mounjaro) to submit photographic evidence before their order can be approved. This flow is a **clinical safety requirement**, not optional. The photos are reviewed by licensed clinicians to verify identity and reported weight.

---

## 2. Service map context

Photo capture sits within a broader patient journey. Understanding where it falls helps explain the UX decisions.

| Stage | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|-------|---|---|---|---|---|---|---|
| | **Consultation** | **Payment** | **Order confirmation + Evidence briefing** | **Upload photos** | **Email (if Transfer)** | **Triage / Initial review** | **On hold** |
| **Users** | Patient | Patient | Patient | Patient | Patient | Technicians + Prescribers | |
| **App** | PIPP | PIPP | PIPP | PIPP | PIPP / Postmark | | |
| **Pain points** | No expectation setting of photos required | No expectation setting of photos required | | | | | |

**Key observations from the service map:**

- Patients have **no warning that photos will be required** until stage 3 (order confirmation). By this point they've already completed consultation and payment. This makes the photo upload feel like an unexpected hurdle rather than a known step.
- The photo upload (stage 4) is the patient's last active task before clinical review. If they abandon here, the order stalls.
- There is an opportunity at stages 1-2 to set expectations earlier (e.g. mentioning photo requirements during consultation or at checkout).
- The "on hold" stage (7) implies photos can be rejected and re-requested, which the upload flow needs to support.

---

## 3. Required photos (first-time order)

| # | Photo type | Clinical purpose | Camera | Timer needed? |
|---|-----------|-----------------|--------|--------------|
| 1 | **Photo ID** | Identity verification per clinical protocol | Rear camera | No -- patient holds phone over ID |
| 2 | **Front-facing photo** of patient | Visual weight assessment by clinician | Rear camera | **Yes** -- patient must be in frame, full body |
| 3 | **Side-on photo** of patient | Second angle for clinical assessment | Rear camera | **Yes** -- patient must be in frame, full body |
| 4 | **Weight reading photo** | Verify reported weight matches visual evidence | Rear camera | No -- patient points phone at scales |

All photos use the rear camera. For body shots (front-facing and side-on), the patient cannot hold the phone and be in a full-body frame simultaneously. They will need to prop the phone up and use a timer. This is why a **custom in-app camera with built-in countdown timer** is essential -- we cannot rely on patients knowing how to find the timer in their native camera app.

---

## 3. User flows

### 3.1 Mobile direct (primary path)

This is the expected primary path. Most patients will be on their phone when they receive the order confirmation.

```
Order Confirmation (landing page)
  --> "Upload all photos" button
    --> Upload Page (/photo-capture/upload)
      --> Tap "Take photo ID" --> in-app camera opens --> photo taken
      --> Tap "Take front-facing photo" --> in-app camera (with timer) --> photo taken
      --> Tap "Take side-on photo" --> in-app camera (with timer) --> photo taken
      --> Tap "Take weight reading photo" --> in-app camera opens --> photo taken
      --> "Complete upload" --> Submit confirmation modal
        --> "Submit photos for review" (submits)
        --> "Go back and review uploads" (returns to upload page)
```

**Key decisions:**

- Each button opens a **custom in-app camera** (WebRTC), not a file picker or native camera app. This gives us full control over the experience, particularly the timer for body shots.
- Button labels say **"Take..."** on mobile (action-oriented) vs **"Select..."** on desktop.
- After each photo is taken, the dashed dropzone is **replaced with a thumbnail preview + green "Photo captured" confirmation + "Retake" button**. This gives immediate visual feedback that the photo was successfully captured.

### 3.2 Desktop with QR handoff (secondary path)

For patients who check their order confirmation on a desktop or laptop.

```
Order Confirmation (desktop)
  --> "Upload all photos"
    --> Upload Page
      --> Click any "Select [photo]" button
        --> QR code bottom sheet modal opens
          --> Patient scans QR with phone camera
            --> Phone opens dedicated camera page
              --> Taps "Open camera"
              --> Takes photo
              --> Success screen: "Photo sent! You can return to your desktop."
          --> Desktop modal updates: spinner --> "Photo received!" with thumbnail
        --> Close modal
```

**Key decisions:**

- On desktop, clicking any upload button opens the **QR modal** rather than a file picker. These photos need to be taken live (body photos, weight reading), so a file picker is the wrong paradigm.
- The QR code encodes a URL with a unique session ID (`/photo-capture/camera?session=abc123`) to link the mobile and desktop sessions.
- The camera page on mobile is **minimal and focused** -- heading, one button, success state. No navigation or distractions. The patient's job on this page is singular.
- The desktop polls for the photo every 2 seconds. When received, the "Waiting for photos..." spinner is replaced with a green check + thumbnail preview.
- Photos are compressed client-side before transmission (max 400px, JPEG quality 0.6) to keep the sync reliable.

---

## 5. Screen-by-screen breakdown

### 5.1 Order Confirmation (landing page)

The first thing a patient sees post-purchase.

**Elements:**

- **"Get approved sooner" badge** -- frames photo upload as beneficial to the patient, not just a requirement
- **Bullet list of the 4 required photos** -- sets expectations before entering the upload flow
- **"Upload all photos" primary CTA**
- **Info box** -- "If you are transferring from another provider upload your previous evidence." Acknowledges returning patients.
- **Order details card** -- treatment, delivery address, payment summary. Provides context and confidence.
- **"Track your progress" card** -- secondary engagement (weight tracking feature)

### 5.2 Upload Page (/photo-capture/upload)

The core photo capture experience. Structured as a **single scrollable page** with clear sections.

**Header:**
- Back arrow (returns to order confirmation)
- Phlo Clinic logo (centred)

**Intro section:**
- "Upload your photos" heading
- "We need each type of photo below to verify your reported weight."
- **Security trust box**: *"Your photos are stored securely -- Encrypted and reviewed **only** by licensed clinicians. **We delete Photo ID** after 90 days."*
  - This is critical for conversion. Patients are uploading sensitive photos (government ID, full body). Explicit mention of deletion and clinician-only access addresses the primary anxiety.

**Photo sections (repeated pattern for each of the 4 photo types):**

1. Section heading (e.g. "Photo ID", "1. Front-facing photo of yourself")
2. Explanatory copy where needed
3. **Example image** -- shows the patient exactly what a good submission looks like
4. **Do / Don't checklist** with green check / red X icons
5. **Upload dropzone** -- dashed border, single CTA button

**Do/Don't checklists per photo type:**

| Photo ID | Front-facing | Side-on | Weight reading |
|----------|-------------|---------|----------------|
| **Accepted:** Passport (any country), driving licence (UK/EEA), PASS card, BRP, national ID, armed forces/police ID, government travel pass | **Do:** Full body + face, lightweight clothing, taken today, clear + well lit | **Do:** Full body + face, lightweight clothing, taken today, clear + well lit | **Do:** Show weight clearly, include toes, taken today, clear + well lit |
| **Not accepted:** Screenshots, photocopies, expired docs, work/student badges | **Don't:** Include other people, use holiday/social photos | **Don't:** Include other people, use holiday/social photos | **Don't:** Blur or crop the display |

**Bottom elements:**
- **Warning banner**: *"Any edited, filtered or AI-generated photos will result in your order being **rejected** and future requests declined."* -- placed immediately before the submit button.
- **"Complete upload" button** -- triggers the submit confirmation modal.

### 5.3 Captured photo state

When a photo has been successfully taken, the dropzone is replaced with:

- Thumbnail preview of the captured photo (left-aligned)
- Green check circle icon + **"Photo captured"** text
- **"Retake" button** -- allows correction without losing other photos

This state change is the primary feedback mechanism. Without it, patients have no confirmation that their photo was successfully captured.

### 5.4 In-App Camera (custom WebRTC camera)

A full-screen camera view built into the app, replacing the native camera. This gives us control over the timer, framing guidance, and the overall capture experience.

**Why custom over native camera:**
- Patients taking body shots (front-facing, side-on) will prop their phone up on a surface and step back. They need a **countdown timer** to give themselves time to get into position. Most patients won't know how to find the timer in their native camera app.
- A custom camera lets us show **framing guides** (e.g. body outline overlay) in future iterations.
- It keeps the patient inside the app flow rather than switching to a separate app and back.

**Camera view layout:**

```
+----------------------------------+
|  [X Close]              [Flip]   |
|                                  |
|                                  |
|        Live viewfinder           |
|        (full screen)             |
|                                  |
|                                  |
|                                  |
|                                  |
|   [3s]  [5s]  [10s]             |
|                                  |
|         [ Capture ]              |
+----------------------------------+
```

**Elements:**
- **Live viewfinder** -- full-screen camera feed via `getUserMedia`, rear camera by default
- **Close button** (top left) -- exits camera, returns to upload page without capturing
- **Flip camera button** (top right) -- toggles between rear and front camera (for patients using a mirror or in different setups)
- **Timer buttons** -- 3s, 5s, 10s options. Tapping one selects it (highlighted state). Timer is optional -- patient can also tap capture immediately for no delay.
- **Capture button** -- large circular button at bottom centre. If a timer is selected, starts the countdown; otherwise captures immediately.

**Countdown state:**
- Large countdown number overlaid on the viewfinder (e.g. "3", "2", "1")
- Subtle pulse animation on each tick
- Auto-captures when countdown reaches zero
- Patient can tap capture button again to cancel the countdown

**Post-capture review:**
- Viewfinder freezes on the captured frame
- Two buttons appear:
  - **"Use photo"** -- accepts the photo, returns to upload page with thumbnail shown in the captured state
  - **"Retake"** -- discards and returns to live viewfinder

**Technical notes:**
- Uses `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` for rear camera
- Captures frame from `<video>` element by drawing to a `<canvas>`
- No photo is sent to any server from this view -- the data URL is stored in local component state and shown as the thumbnail on the upload page
- Camera stream is stopped (`track.stop()`) when the view is closed to release the hardware

### 5.5 Submit Confirmation Modal

Bottom sheet that slides up when "Complete upload" is tapped.

**Content:**
- **"Before you submit your photos"** heading (no close X icon -- deliberate)
- *"To avoid delays, please make sure you've uploaded everything currently required for your order."*
- **Dynamic checklist card** labelled "First time upload":
  - Photo ID -- green check or red X depending on whether it's been captured
  - Front-facing photo -- same
  - Side-on photo -- same
  - Weight reading -- same
- **Info banner**: *"If your order was put on hold -- Check your email for details on which additional photos are needed and upload them before submitting."*
- **"Submit photos for review"** -- primary action
- **"Go back and review uploads"** -- secondary action with back arrow icon

**Design decisions:**
- No close X icon on this modal. The two explicit actions ("Submit" or "Go back") are the only exit paths, forcing a conscious decision.
- The checklist updates in real-time based on what's been captured in the session, giving patients a final "have I done everything?" check.
- Dashed border card (8px dash, 8px gap) with light grey background (#F9F9F9) -- visually distinct from the modal surface.
- Checklist items are left-aligned for scannability.

### 5.6 QR Code Modal (desktop)

Bottom sheet that opens when a desktop user clicks any upload button.

**Content:**
- "Take photos on your mobile" heading + close X icon
- QR code (180px, dark navy #07073D on white)
- *"Scan this QR code with your phone camera to open the upload page and take your photos directly."*
- Divider
- **Waiting section**: spinner + "Waiting for photos..." -- updates to green check + thumbnail + "Photo received!" on receipt
- "Cancel" secondary button

### 5.7 Camera Page (/photo-capture/camera -- QR flow)

Minimal dedicated page opened on the patient's phone after scanning the QR code.

**Ready state:**
- Phlo logo header (centred, no navigation)
- "Take your photo" heading
- "Tap the button below to open your camera and take a photo."
- "Open camera" primary button

**Success state:**
- Green check circle icon
- "Photo sent!"
- "You can now return to your desktop to continue."

No back button, no navigation. This page has exactly one job.

---

## 6. Cross-device sync architecture

```
Desktop                              Mobile (via QR)
  |                                    |
  | QR contains unique session ID      |
  |---------- scans QR --------------->|
  |                                    |
  |                              Opens /photo-capture/camera?session=xyz
  |                                    |
  |                              Takes photo
  |                                    |
  |                              Compresses (400px max, JPEG 0.6)
  |                                    |
  |                              POST /api/photo?session=xyz
  |                                    |
  |   Polls GET /api/photo?session=xyz every 2s
  |<---------- photo data -------------|
  |                                    |
  | UI updates: "Photo received!"      | Shows: "Photo sent!"
```

- Session IDs: random 8-character alphanumeric strings, generated fresh each time the QR modal opens
- Storage: Upstash Redis with 5-minute TTL (auto-expires)
- Compression: client-side resize to max 400px dimension, JPEG quality 0.6

---

## 7. UX principles applied

| Principle | How it's applied |
|-----------|-----------------|
| **Immediate feedback** | Every photo capture shows a thumbnail + "Photo captured" confirmation. No ambiguity. |
| **Context-appropriate input** | Custom in-app camera with timer for body shots; desktop redirects to phone via QR. No file picker for live photos. |
| **Trust before sensitive asks** | Security messaging ("encrypted", "clinician-only", "deleted after 90 days") appears before the first upload button. |
| **Guided photography** | Example images + do/don't checklists for each photo type reduce re-submissions. |
| **Deterrence over prevention** | The AI/editing warning is prominent but doesn't block submission. Makes consequences clear. |
| **Progressive disclosure** | Landing page shows 4 photo types as bullet list; upload page expands each with full guidance. |
| **Forgiving interaction** | "Retake" button on every captured photo. Post-capture review screen before accepting. Submit confirmation with dynamic checklist as safety net. |
| **Self-service photography** | Built-in camera timer (3s/5s/10s) so patients can take their own full-body shots without needing another person to help. |

---

## 8. Open areas and future considerations

- **Multi-photo QR flow**: Currently the QR camera page handles one photo at a time. Future iteration could support all 4 photos sequentially through the QR flow, with the in-app camera and timer.
- **Re-upload / on-hold flow**: The submit modal mentions "if your order was put on hold" but the upload page doesn't currently differentiate between first-time and re-upload scenarios. The checklist heading "First time upload" implies other variants will follow.
- **Photo quality validation**: No client-side validation currently (blur detection, face detection, etc.). All validation happens during clinician review. The custom camera opens the door to adding real-time guidance overlays (body outline, face detection prompts) in future.
- **Gallery fallback for weight reading**: Consider allowing gallery access specifically for weight reading (smart scales app screenshots are valid evidence). The in-app camera could offer a "Choose from gallery" option for this photo type only.
- **Framing guides**: With the custom camera, we could overlay a body silhouette outline for front-facing and side-on shots to help patients frame themselves correctly.
- **Expectation setting earlier in the journey**: The service map shows patients have no warning about photo requirements until stage 3. Adding a mention during consultation (stage 1) or at checkout (stage 2) would reduce friction at the upload stage.
- **Accessibility**: Screen reader labels exist on images but custom button implementations and the camera view may need review for full keyboard navigation and VoiceOver support.
- **Browser camera permissions**: The in-app camera requires the user to grant camera access via the browser permission prompt. Need clear fallback messaging if permission is denied, and guidance copy explaining why camera access is needed.
