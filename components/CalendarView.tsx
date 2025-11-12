'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/id';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useGoogleCalendar } from '@/context/GoogleCalendarContext';

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

  // Convert optimized schedule to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

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

    // Also add events from scheduleItems if available
    if (scheduleItems) {
      scheduleItems.forEach((item) => {
        if (!item.day || !item.startTime || !item.endTime) return;

        const dayNumber = dayNameMap[item.day];
        if (dayNumber === undefined) return;

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
    let backgroundColor = '#3b82f6'; // Default blue

    switch (event.resource.type) {
      case 'kuliah':
        backgroundColor = '#3b82f6'; // Blue
        break;
      case 'kegiatan':
        backgroundColor = '#10b981'; // Green
        break;
      case 'seminar':
        backgroundColor = '#f59e0b'; // Yellow
        break;
      case 'lomba':
        backgroundColor = '#ef4444'; // Red
        break;
      case 'ukm':
        backgroundColor = '#06b6d4'; // Cyan
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
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
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kalender Jadwal</h2>
        <button
          onClick={handleSyncToGoogle}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isSyncing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSyncing
            ? 'Menyinkronkan...'
            : isAuthenticated
            ? '🔄 Sync ke Google Calendar'
            : '🔐 Login & Sync Google Calendar'}
        </button>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm">Kuliah</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Kegiatan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Seminar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Lomba</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-500 rounded"></div>
          <span className="text-sm">UKM</span>
        </div>
      </div>

      <div style={{ height: '600px' }}>
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
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          font-size: 14px;
          background-color: #f3f4f6;
          border-bottom: 2px solid #e5e7eb;
        }
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .rbc-time-slot {
          min-height: 40px;
        }
        .rbc-today {
          background-color: #eff6ff;
        }
        .rbc-toolbar button {
          color: #374151;
          font-weight: 500;
          border: 1px solid #d1d5db;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .rbc-event {
          padding: 2px 5px;
          font-size: 12px;
        }
        .rbc-event-label {
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}
