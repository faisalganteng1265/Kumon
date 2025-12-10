'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/id';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useGoogleCalendar, type SyncResult } from '@/context/GoogleCalendarContext';

moment.locale('id');
const localizer = momentLocalizer(moment);

interface ScheduleItem {
  id?: string;
  type: 'kuliah' | 'kegiatan';
  name: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  priority?: 'tinggi' | 'sedang' | 'rendah';
  location?: string;
  description?: string;
  courseType?: 'teori' | 'praktikum' | 'lab' | 'seminar';
}

interface DaySchedule {
  time: string;
  activity: string;
  type: string;
  location?: string;
  description?: string;
  color?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: string;
    location?: string;
    description?: string;
    priority?: string;
  };
}

interface CalendarViewProps {
  optimizedSchedule?: {
    [key: string]: DaySchedule[];
  };
  scheduleItems?: ScheduleItem[];
}

const dayNameMap: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 0,
};

export default function CalendarView({ optimizedSchedule, scheduleItems }: CalendarViewProps) {
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());
  const { isAuthenticated, login, syncToGoogleCalendar } = useGoogleCalendar();
  const [isSyncing, setIsSyncing] = useState(false);
  const [calendarWidth, setCalendarWidth] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      // Set min and max width constraints
      if (newWidth >= 400 && newWidth <= containerRect.width) {
        setCalendarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Convert optimized schedule to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];
    const eventKeys = new Set<string>(); // To track unique events

    if (optimizedSchedule) {
      Object.entries(optimizedSchedule).forEach(([day, schedules]) => {
        const dayNumber = dayNameMap[day];
        if (dayNumber === undefined) return;

        // Get the next occurrence of this day
        const today = moment().startOf('week');
        const eventDate = today.clone().day(dayNumber);

        schedules.forEach((schedule, index) => {
          // Skip routine activities like sleep, breakfast, etc.
          if (schedule.type === 'routine') return;

          // Parse time range (e.g., "08:00-10:00")
          const [startTime, endTime] = schedule.time.split('-');
          if (!startTime || !endTime) return;

          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);

          const start = eventDate.clone().hour(startHour).minute(startMinute).toDate();
          const end = eventDate.clone().hour(endHour).minute(endMinute).toDate();

          // Create unique key for this event
          const eventKey = `${day}-${schedule.activity}-${startTime}-${endTime}`;

          // Skip if already added
          if (eventKeys.has(eventKey)) return;
          eventKeys.add(eventKey);

          calendarEvents.push({
            id: `${day}-${index}`,
            title: schedule.activity,
            start,
            end,
            resource: {
              type: schedule.type,
              location: schedule.location,
              description: schedule.description,
              priority: undefined,
            },
          });
        });
      });
    }

    // Also add events from scheduleItems if available (skip duplicates)
    if (scheduleItems) {
      scheduleItems.forEach((item) => {
        if (!item.day || !item.startTime || !item.endTime) return;

        const dayNumber = dayNameMap[item.day];
        if (dayNumber === undefined) return;

        // Create unique key for this event
        const eventKey = `${item.day}-${item.name}-${item.startTime}-${item.endTime}`;

        // Skip if already added
        if (eventKeys.has(eventKey)) return;
        eventKeys.add(eventKey);

        const today = moment().startOf('week');
        const eventDate = today.clone().day(dayNumber);

        const [startHour, startMinute] = item.startTime.split(':').map(Number);
        const [endHour, endMinute] = item.endTime.split(':').map(Number);

        const start = eventDate.clone().hour(startHour).minute(startMinute).toDate();
        const end = eventDate.clone().hour(endHour).minute(endMinute).toDate();

        calendarEvents.push({
          id: item.id || `item-${item.name}`,
          title: item.name,
          start,
          end,
          resource: {
            type: item.type,
            location: item.location,
            description: item.description,
            priority: item.priority,
          },
        });
      });
    }

    return calendarEvents;
  }, [optimizedSchedule, scheduleItems]);

  const handleSyncToGoogle = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    try {
      setIsSyncing(true);

      // Filter and validate events - skip routine events and ensure valid dates
      const eventsToSync = events
        .filter(event => {
          // Skip routine events
          if (event.resource.type === 'routine') return false;

          // Validate dates
          const start = new Date(event.start);
          const end = new Date(event.end);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn('Invalid date for event:', event.title);
            return false;
          }

          if (end <= start) {
            console.warn('End time before start time for event:', event.title);
            return false;
          }

          return true;
        })
        .map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          description: event.resource.description || '',
          location: event.resource.location || '',
          type: event.resource.type,
        }));

      console.log('Total events:', events.length);
      console.log('Events to sync (after filtering):', eventsToSync.length);
      console.log('First event sample:', eventsToSync[0]);

      if (eventsToSync.length === 0) {
        alert('Tidak ada jadwal untuk disinkronkan. Silakan generate jadwal terlebih dahulu.');
        return;
      }

      const result = await syncToGoogleCalendar(eventsToSync);
      console.log('Sync result:', result);

      if (result.errors && result.errors.length > 0) {
        console.error('Sync errors:', result.errors);
        alert(`Berhasil sync ${result.syncedCount} dari ${eventsToSync.length} jadwal.\n\nGagal: ${result.errors.length} jadwal.\nSilakan cek console untuk detail error.`);
      } else {
        alert(`Berhasil menyinkronkan ${result.syncedCount} jadwal ke Google Calendar! Silakan cek Google Calendar Anda.`);
      }
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      alert(`Gagal menyinkronkan ke Google Calendar. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#1f2937'; // Default dark gray
    let borderColor = '#60a5fa'; // Default light blue border

    switch (event.resource.type) {
      case 'kuliah':
        backgroundColor = '#1e40af'; // Dark blue
        borderColor = '#60a5fa'; // Light blue
        break;
      case 'kegiatan':
        backgroundColor = '#047857'; // Dark green
        borderColor = '#34d399'; // Light green
        break;
      case 'seminar':
        backgroundColor = '#d97706'; // Dark orange
        borderColor = '#fbbf24'; // Light yellow
        break;
      case 'lomba':
        backgroundColor = '#b91c1c'; // Dark red
        borderColor = '#f87171'; // Light red
        break;
      case 'ukm':
        backgroundColor = '#0e7490'; // Dark cyan
        borderColor = '#22d3ee'; // Light cyan
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 1,
        color: 'white',
        border: `2px solid ${borderColor}`,
        display: 'block',
        fontWeight: '600',
      },
    };
  };

  const CustomEvent = ({ event }: { event: CalendarEvent }) => (
    <div className="p-1">
      <strong>{event.title}</strong>
      {event.resource.location && (
        <div className="text-xs">📍 {event.resource.location}</div>
      )}
    </div>
  );

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Kalender Jadwal</h2>
        <button
          onClick={handleSyncToGoogle}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-3xl font-semibold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
            isSyncing
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-[#ff5757] hover:bg-[#ff3333] text-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          {isSyncing
            ? 'Menyinkronkan...'
            : isAuthenticated
            ? '🔄 Sync ke Google Calendar'
            : '🔐 Login & Sync Google Calendar'}
        </button>
      </div>

      <div className="mb-4 flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-4 h-4 bg-blue-700 rounded border-2 border-blue-400"></div>
          <span className="text-sm font-semibold text-black">Kuliah</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-4 h-4 bg-green-700 rounded border-2 border-green-400"></div>
          <span className="text-sm font-semibold text-black">Kegiatan</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-4 h-4 bg-orange-600 rounded border-2 border-yellow-400"></div>
          <span className="text-sm font-semibold text-black">Seminar</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-4 h-4 bg-red-700 rounded border-2 border-red-400"></div>
          <span className="text-sm font-semibold text-black">Lomba</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-4 h-4 bg-cyan-700 rounded border-2 border-cyan-400"></div>
          <span className="text-sm font-semibold text-black">UKM</span>
        </div>
      </div>

      <div className="px-4" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEvent,
          }}
          messages={{
            week: 'Minggu',
            work_week: 'Minggu Kerja',
            day: 'Hari',
            month: 'Bulan',
            previous: 'Sebelumnya',
            next: 'Selanjutnya',
            today: 'Hari Ini',
            agenda: 'Agenda',
            date: 'Tanggal',
            time: 'Waktu',
            event: 'Acara',
            noEventsInRange: 'Tidak ada acara dalam rentang ini.',
            showMore: (total) => `+${total} lainnya`,
          }}
          min={new Date(2025, 0, 1, 6, 0, 0)} // Start at 6 AM
          max={new Date(2025, 0, 1, 23, 0, 0)} // End at 11 PM
          step={30}
          timeslots={2}
        />
      </div>

      <style jsx global>{`
        .rbc-calendar {
          font-family: 'Inter', sans-serif;
          background-color: #fef9ed;
          color: #000000;
        }
        .rbc-header {
          padding: 12px 3px;
          font-weight: 700;
          font-size: 14px;
          background-color: #ffffff;
          color: #000000;
          border-bottom: 2px solid #000000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rbc-time-view {
          background-color: #ffffff;
          border: 2px solid #000000;
          border-radius: 12px;
          overflow: hidden;
        }
        .rbc-time-slot {
          min-height: 40px;
          border-top: 1px solid #e5e5e5;
        }
        .rbc-time-content {
          border-top: 2px solid #000000;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #e5e5e5;
        }
        .rbc-timeslot-group {
          min-height: 80px;
          border-left: 1px solid #cccccc;
        }
        .rbc-day-slot .rbc-events-container {
          margin-right: 0;
        }
        .rbc-time-header-content {
          border-left: 1px solid #cccccc;
        }
        .rbc-time-content > * + * > * {
          border-left: 1px solid #cccccc;
        }
        .rbc-current-time-indicator {
          background-color: #ff5757;
          height: 2px;
        }
        .rbc-today {
          background-color: #ffe5e5;
        }
        .rbc-label {
          color: #000000;
          font-weight: 600;
          padding: 8px 12px;
        }
        .rbc-toolbar {
          background-color: #ffffff;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
        }
        .rbc-toolbar button {
          color: #000000;
          font-weight: 500;
          border: 2px solid #000000;
          background-color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
        }
        .rbc-toolbar button:hover {
          background-color: #ff5757;
          color: #ffffff;
          border-color: #000000;
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 1);
        }
        .rbc-toolbar button.rbc-active {
          background-color: #ff5757;
          color: white;
          border-color: #000000;
        }
        .rbc-toolbar-label {
          color: #000000;
          font-weight: 700;
          font-size: 16px;
        }
        .rbc-event {
          padding: 4px 6px;
          font-size: 13px;
          font-weight: 600;
        }
        .rbc-event-label {
          font-size: 11px;
        }
        .rbc-event-content {
          font-weight: 600;
        }
        .rbc-header + .rbc-header {
          border-left: 1px solid #cccccc;
        }
        .rbc-month-view {
          background-color: #ffffff;
          border: 2px solid #000000;
          border-radius: 12px;
        }
        .rbc-month-row {
          border-top: 1px solid #cccccc;
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #e5e5e5;
        }
        .rbc-off-range-bg {
          background-color: #f5f5f5;
        }
        .rbc-date-cell {
          padding: 8px;
        }
        .rbc-button-link {
          color: #000000;
          font-weight: 600;
        }
        .rbc-show-more {
          background-color: #ff5757;
          color: #ffffff;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          margin: 2px 0;
        }
        .rbc-overlay {
          background-color: #ffffff;
          border: 2px solid #000000;
          border-radius: 12px;
          box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);
        }
        .rbc-overlay-header {
          background-color: #fef9ed;
          border-bottom: 2px solid #000000;
          padding: 12px;
          font-weight: 700;
          color: #000000;
        }

        /* Custom Scrollbar Styling */
        .rbc-time-content::-webkit-scrollbar {
          width: 14px;
        }
        .rbc-time-content::-webkit-scrollbar-track {
          background: transparent;
          margin: 8px 0;
        }
        .rbc-time-content::-webkit-scrollbar-thumb {
          background: #cccccc;
          border-radius: 10px;
          border: 3px solid #ffffff;
          background-clip: padding-box;
        }
        .rbc-time-content::-webkit-scrollbar-thumb:hover {
          background: #999999;
          border: 3px solid #ffffff;
          background-clip: padding-box;
        }

        /* Firefox scrollbar */
        .rbc-time-content {
          scrollbar-width: thin;
          scrollbar-color: #cccccc transparent;
        }

        /* Add padding to time content for scrollbar spacing */
        .rbc-time-content {
          padding-right: 4px;
        }
      `}</style>
    </div>
  );
}
