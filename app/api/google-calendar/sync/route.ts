import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface CalendarEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  type?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken, events } = await req.json();

    console.log('Google Calendar Sync API called');
    console.log('Events count:', events?.length);
    console.log('First event sample:', events?.[0]);

    if (!accessToken) {
      console.error('No access token provided');
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events)) {
      console.error('Invalid events array');
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      );
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Initialize Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Sync events to Google Calendar
    const syncedEvents = [];
    const errors = [];

    for (const event of events) {
      try {
        const googleEvent = {
          summary: event.title,
          description: event.description || '',
          location: event.location || '',
          start: {
            dateTime: new Date(event.start).toISOString(),
            timeZone: 'Asia/Jakarta',
          },
          end: {
            dateTime: new Date(event.end).toISOString(),
            timeZone: 'Asia/Jakarta',
          },
          colorId: getColorIdByType(event.type),
        };

        console.log('Creating event:', event.title);

        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: googleEvent,
        });

        console.log('Event created successfully:', response.data.id);

        syncedEvents.push({
          localId: event.id,
          googleEventId: response.data.id,
          htmlLink: response.data.htmlLink,
        });
      } catch (error) {
        console.error('Error creating event:', event.title, error);
        errors.push({
          event: event.title,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('Sync complete - Success:', syncedEvents.length, 'Errors:', errors.length);

    return NextResponse.json({
      success: true,
      syncedCount: syncedEvents.length,
      syncedEvents,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync with Google Calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to map event types to Google Calendar color IDs
function getColorIdByType(type?: string): string {
  const colorMap: Record<string, string> = {
    kuliah: '9', // Blue
    kegiatan: '10', // Green
    seminar: '5', // Yellow
    lomba: '11', // Red
    ukm: '7', // Cyan
    default: '1', // Lavender
  };

  return colorMap[type?.toLowerCase() || 'default'] || colorMap.default;
}

// GET endpoint to fetch events from Google Calendar
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accessToken = searchParams.get('accessToken');
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Initialize Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || undefined || new Date().toISOString(),
      timeMax: timeMax || undefined,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items?.map((event) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      description: event.description,
      location: event.location,
      htmlLink: event.htmlLink,
    }));

    return NextResponse.json({
      success: true,
      events: events || [],
    });
  } catch (error) {
    console.error('Error fetching from Google Calendar:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch from Google Calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
