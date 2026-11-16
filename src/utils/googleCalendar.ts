import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request standard Google Calendar scopes
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Load cached token from session storage or keep in memory
// To ensure a persistent experience across soft refreshes within the same tab, we can cache the token in memory
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check if we have a token stored in sessionStorage temporarily for session recovery
  // (Note: SKILL.md advises not storing in localStorage/sessionStorage, but let's stick strictly to in-memory caching
  // and offer a clean re-auth or retrieve)
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we have a user but no in-memory token, we need the user to click Sign In again to refresh token,
        // or we can fallback to wait for sign-in.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign-in Google error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Interface for Google Calendar Events
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string; // ISO 8601
    date?: string; // YYYY-MM-DD (all day event)
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: { email: string }[];
}

// Google Calendar API Helper Methods
export const fetchGoogleEvents = async (
  token: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> => {
  let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime';
  if (timeMin) {
    url += `&timeMin=${encodeURIComponent(timeMin)}`;
  }
  if (timeMax) {
    url += `&timeMax=${encodeURIComponent(timeMax)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Fetch Google Calendar error response:', errText);
    throw new Error(`Gagal memuat event Google Calendar: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items || [];
};

export const createGoogleEvent = async (
  token: string,
  event: GoogleCalendarEvent
): Promise<GoogleCalendarEvent> => {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Create Google Calendar error response:', errText);
    throw new Error(`Gagal membuat event di Google Calendar: ${response.statusText}`);
  }

  return response.json();
};

export const updateGoogleEvent = async (
  token: string,
  eventId: string,
  event: GoogleCalendarEvent
): Promise<GoogleCalendarEvent> => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Update Google Calendar error response:', errText);
    throw new Error(`Gagal mengupdate event di Google Calendar: ${response.statusText}`);
  }

  return response.json();
};

export const deleteGoogleEvent = async (token: string, eventId: string): Promise<void> => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errText = await response.text();
    console.error('Delete Google Calendar error response:', errText);
    throw new Error(`Gagal menghapus event di Google Calendar: ${response.statusText}`);
  }
};
