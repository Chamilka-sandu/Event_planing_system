import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, format, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';

const API_BASE_URL = 'http://localhost:8080/api'; // Update with your actual base URL

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse: (value: string, format: string) => parse(value, format, new Date()),
  startOfWeek,
  getDay,
  locales,
});

const CalendarComponent: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        const apiEvents = response.data.map((event: any) => ({
          id: event.id,
          title: event.eventTitle,
          start: new Date(event.dateTime),
          end: new Date(new Date(event.dateTime).getTime() + 60 * 60 * 1000), // Add 1 hour as default
        }));
        setEvents(apiEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div style={{ height: '100vh' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleEventClick}
      />

      {/* MUI Dialog for displaying event details */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <div>
              <Typography variant="h6">{selectedEvent.title}</Typography>
              <Typography variant="body1">Start: {selectedEvent.start.toString()}</Typography>
              <Typography variant="body1">End: {selectedEvent.end.toString()}</Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CalendarComponent;
