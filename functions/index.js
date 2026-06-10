const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// A helper function to create an OAuth2 client dynamically,
// since we want to handle the redirect URI based on the request host/protocol.
const getOAuth2Client = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  // For Firebase Functions, we construct the redirect URI using the original base URL
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}${req.baseUrl}/auth/google/callback`;
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth credentials');
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
};

// Milestone 3.1.2: Initiate Google OAuth
app.get("/auth/google", (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    return res.status(400).send("Missing uid parameter");
  }

  const oauth2Client = getOAuth2Client(req);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: uid,
    prompt: 'consent'
  });

  res.redirect(url);
});

// Milestone 3.1.2: Google OAuth Callback
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  const uid = req.query.state;

  if (!code || !uid) {
    return res.status(400).send("Missing code or state");
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens to Firestore
    await admin.firestore()
      .collection("users")
      .doc(uid)
      .collection("integrations")
      .doc("google")
      .set(tokens);

    // Redirect back to the frontend app
    // Assuming the frontend app is hosted on the same domain or a known dev URL
    const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${appUrl}/settings/data`); // Redirect to a generic page or settings
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    res.status(500).send("Authentication failed");
  }
});

// Milestone 3.1.3: Fetch Calendar Events
app.get("/api/calendar/events", async (req, res) => {
  const uid = req.query.uid;
  const timeMin = req.query.timeMin;
  const timeMax = req.query.timeMax;

  if (!uid) {
    return res.status(401).json({ error: "Missing uid parameter" });
  }

  try {
    // Retrieve tokens from Firestore
    const doc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .collection("integrations")
      .doc("google")
      .get();

    if (!doc.exists) {
      return res.status(401).json({ error: "Google Calendar not connected" });
    }

    const tokens = doc.data();
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    // If refresh token exists, googleapis will auto-refresh.
    // If we want to persist the newly refreshed token, we'd listen to 'tokens' event on oauth2Client,
    // but for simplicity, we rely on googleapis doing it in memory for this request.

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin ? new Date(timeMin).toISOString() : undefined,
      timeMax: timeMax ? new Date(timeMax).toISOString() : undefined,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const items = response.data.items || [];
    
    // Map events
    const mappedEvents = items.map(item => {
      let start = item.start.dateTime;
      let end = item.end.dateTime;
      
      if (!start && item.start.date) {
        start = `${item.start.date}T00:00:00`;
        end = `${item.end.date}T23:59:59`;
      }

      return {
        id: `gcal-${item.id}`,
        type: 'event',
        title: item.summary || 'Google Calendar Event',
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        source: 'google',
        isLocked: true
      };
    });

    res.status(200).json({ events: mappedEvents });
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

exports.api = onRequest({ cors: true }, app);

exports.aiManager = onSchedule({ schedule: "0 7,21 * * *", timeZone: "Asia/Jerusalem" }, async (event) => {
  const db = admin.firestore();
  const usersSnapshot = await db.collection("users").get();
  
  const batch = db.batch();
  
  usersSnapshot.forEach(doc => {
    const uid = doc.id;
    const suggestionRef = db.collection("users").doc(uid).collection("cl_aiSuggestions").doc();
    
    // Simulate AI suggestion based on time of day
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    
    let suggestionText = "";
    let contextText = "";
    
    if (isMorning) {
      suggestionText = "Good morning! Focus on high-priority tasks first.";
      contextText = "Morning planning.";
    } else {
      suggestionText = "Evening review: prepare your schedule for tomorrow.";
      contextText = "Evening wrap-up.";
    }

    batch.set(suggestionRef, {
      id: suggestionRef.id,
      userId: uid,
      type: "daily_review",
      suggestion: suggestionText,
      context: contextText,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  console.log(`Generated AI suggestions for ${usersSnapshot.size} users.`);
});
