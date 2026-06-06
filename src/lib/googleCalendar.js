// lib/googleCalendar.js

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let accessToken = null;

export const initGoogleCalendarAuth = () => {
  return new Promise((resolve, reject) => {
    if (tokenClient) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse.error !== undefined) {
            reject(tokenResponse);
          }
          accessToken = tokenResponse.access_token;
          resolve(tokenResponse);
        },
      });
      gisInited = true;
      if (accessToken) resolve(); // already have token? (unlikely on init without localstorage)
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

export const connectGoogleCalendar = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google Identity Services not initialized"));
      return;
    }
    
    // Override callback for this specific request
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      accessToken = resp.access_token;
      // You could persist the token here if you want short-term caching, but 
      // typically tokens expire in 1hr. We just keep it in memory for the session.
      resolve(resp.access_token);
    };

    if (accessToken === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({prompt: ''});
    }
  });
};

export const fetchGoogleEvents = async (dateStr, token) => {
  const tk = token || accessToken;
  if (!tk) throw new Error("No access token available. Please connect Google Calendar.");

  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.append('timeMin', startOfDay.toISOString());
  url.searchParams.append('timeMax', endOfDay.toISOString());
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${tk}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Transform to our block format
  return (data.items || []).map(item => {
    // Determine start/end times
    let start = item.start.dateTime;
    let end = item.end.dateTime;
    
    // Handle all-day events
    if (!start && item.start.date) {
      start = `${item.start.date}T00:00:00`;
      end = `${item.end.date}T23:59:59`; // Usually exclusive next day, but simplify
    }
    
    const startTimeStr = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTimeStr = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    return {
      id: `gcal-${item.id}`,
      type: 'event', // Use existing type
      title: item.summary || 'Google Calendar Event',
      startTime: startTimeStr,
      endTime: endTimeStr,
      source: 'gcal',
      isLocked: true // Phase 6f explicitly says inject as 'Locked' blocks
    };
  });
};
