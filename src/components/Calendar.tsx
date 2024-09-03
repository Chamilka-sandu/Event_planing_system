import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField, FormControl, Select, MenuItem, FormControlLabel, Switch, RadioGroup, Radio, ListItemText, Checkbox, OutlinedInput, Typography, FormHelperText } from '@mui/material';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import enUS from 'date-fns/locale/en-US';
import { createEvent, getAllEvents, Event as APIEvent } from '../services/Api'; // Import API functions
import { fetchUsers } from '../services/Apiusers';
import { Group, User, getAllGroups } from '../services/Apigroup';
import CalendarComponent from './EventCalender';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse: (value: string, formatStr: string) => parseISO(value),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Event {
  eventTitle: string;
  description: string;
  start: Date;
  end: Date;
  dateTime: string;
  venue: {
    address: string;
    latitude: number;
    longitude: number;
  };
  eventType: 'Conference' | 'Meetup' | 'Workshop';
  isPublic: boolean;
  status: 'SCHEDULED' | 'ONGOING' | 'POSTPONED' | 'CANCELLED';
  inviteType: 'group' | 'individual';
  attendees: string[];
  invitedGroups: Group[];
  invitedUsers: User[];
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<APIEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);


  interface User {
    userId: number;
    userName: string;
  }

  interface Group {
    groupCode: number;
    Name: string;
  }
  const [newEvent, setNewEvent] = useState<APIEvent>({
    eventId: 0,
    eventTitle: '',
    description: '',

    dateTime: new Date(), // Ensure this matches the expected type
    venue: {
      address: '',
      latitude: 0,
      longitude: 0,
    },
    eventType: '',
    isPublic: false,
    status: 'SCHEDULED',
    inviteType: '',

    invitedGroups: [],
    invitedUsers: [],

  });

  useEffect(() => {
    const getUsers = async () => {
      try {
        const userData = await fetchUsers();
        setUsers(userData);
        console.log("Users fetched:", userData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsData = await getAllGroups();
        if (Array.isArray(groupsData)) {
          setGroups(groupsData);
        } else {
          console.error('Fetched data is not an array:', groupsData);
          setGroups([]); // Handle unexpected data type
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]); // Handle error by setting an empty array
      }
    };
    fetchGroups();
  }, []);


  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};
    const currentDate = new Date();

    if (!newEvent.eventTitle) tempErrors.eventTitle = 'Event title is required';
    if (!newEvent.dateTime) tempErrors.dateTime = 'Date & Time is required';
    else if (newEvent.dateTime < currentDate) tempErrors.dateTime = 'Cannot create event for past dates';
    if (!newEvent.venue.address) tempErrors.venue = 'Venue address is required';

    if (newEvent.inviteType === 'individual' && newEvent.invitedUsers.length === 0) {
      tempErrors.invitedUsers = 'At least one user must be selected';
    }

    if (newEvent.inviteType === 'group' && newEvent.invitedGroups.length === 0) {
      tempErrors.invitedGroups = 'At least one group must be selected';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getAllEvents();
        if (Array.isArray(fetchedEvents)) {
          setEvents(fetchedEvents);
        } else {
          console.error('Invalid events data:', fetchedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events', error);
      }
    };

    fetchEvents();
  }, []);



  const handleSelectEvent = (event: APIEvent) => {
    alert(`Event: ${event.eventTitle}`);
  };

  const handleSave = async () => {
    if (validateForm()) {

    try {
      const savedEvent = await createEvent(newEvent);
      setEvents([...events, savedEvent]);
      setModalOpen(false);
      console.log("Event created successfully", savedEvent);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }
  };

  const handleChangeMembers = (event: any) => {
    const {
      target: { value },
    } = event;
    const selectedUsers = typeof value === 'string'
      ? value.split(',').map(userName => users.find(user => user.userName === userName)!)
      : value.map((userName: string) => users.find(user => user.userName === userName)!);

    setNewEvent({
      ...newEvent,
      invitedUsers: selectedUsers,
    });
  };

  const handleChangeGroup = (event: any) => {
    const {
      target: { value },
    } = event;
    const selectedGroups = typeof value === 'string'
      ? value.split(',').map(groupName => groups.find(group => group.groupName === groupName)!)
      : value.map((groupName: string) => groups.find(group => group.groupName === groupName)!);

    setNewEvent({
      ...newEvent,
      invitedGroups: selectedGroups,
    });
  };

  return (
    <div>
      <Button variant="outlined" onClick={() => setModalOpen(true)}>Create Event</Button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div style={{ padding: '20px', backgroundColor: 'white', margin: '50px auto', width: '80%', maxHeight: '90vh', overflowY: 'auto' }}>
          <h3>Create New Event</h3>
          <form style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <TextField
              label="Event Title"
              fullWidth
              value={newEvent.eventTitle}
              onChange={(e) => setNewEvent({ ...newEvent, eventTitle: e.target.value })}
              error={!!errors.eventTitle}
              helperText={errors.eventTitle}
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="Date & Time"
              type="datetime-local"
              fullWidth
              value={format(newEvent.dateTime, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setNewEvent({ ...newEvent, dateTime: new Date(e.target.value) })}
              error={!!errors.dateTime}
              helperText={errors.dateTime}
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="Address"
              fullWidth
              value={newEvent.venue.address}
              onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, address: e.target.value } })}
              style={{ marginBottom: '16px' }}
              error={!!errors.venue}
            helperText={errors.venue}
            />
            <TextField
              label="Latitude"
              type="number"
              fullWidth
              value={newEvent.venue.latitude}
              onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, latitude: Number(e.target.value) } })}
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="Longitude"
              type="number"
              fullWidth
              value={newEvent.venue.longitude}
              onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, longitude: Number(e.target.value) } })}
              style={{ marginBottom: '16px' }}
            />
            <Typography style={{ marginRight: '16px', color: 'gray' }}>Event Type</Typography>

            <FormControl fullWidth margin="normal">
              <Select
                label='eventType'
                value={newEvent.eventType || ''}
                onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value as '' | 'Conference' | 'Meetup' | 'Workshop' })}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>Select Event Type</em>;
                  }
                  return selected;
                }}
              >
                <MenuItem value=""><em>Select Event Type</em></MenuItem>
                <MenuItem value="Conference">Conference</MenuItem>
                <MenuItem value="Meetup">Meetup</MenuItem>
                <MenuItem value="Workshop">Workshop</MenuItem>
              </Select>
            </FormControl>

            <Typography style={{ marginRight: '16px', color: 'gray' }}>Invite Type</Typography>

            <FormControl component="fieldset" fullWidth style={{ marginBottom: '16px' }}>
              <RadioGroup
                value={newEvent.inviteType}
                onChange={(e) => setNewEvent({ ...newEvent, inviteType: e.target.value as 'group' | 'individual' })}
                row
              >
                <FormControlLabel value="group" control={<Radio />} label="Group" />
                <FormControlLabel value="individual" control={<Radio />} label="Individual" />
              </RadioGroup>
            </FormControl>



            {newEvent.inviteType === 'individual' && (

              <FormControl fullWidth style={{ marginBottom: '16px' }}>
                <Select
                  multiple
                  value={newEvent.invitedUsers.map(member => member.userName)}
                  onChange={handleChangeMembers}
                  input={<OutlinedInput label="Users" />}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>Select Users</em>;
                    }
                    return selected.join(', ');
                  }}
                  
                >
                  <MenuItem value="" disabled>
                    <em>Select Users</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.userId} value={user.userName}>
                      <Checkbox checked={newEvent.invitedUsers.some(member => member.userName === user.userName)} />
                      <ListItemText primary={user.userName} />
                    </MenuItem>
                  ))}
                </Select>
                {!!errors.invitedUsers && (
                <FormHelperText sx={{ color: 'red'}} >{errors.invitedUsers}</FormHelperText>
              )}
              </FormControl>

            )}

            {newEvent.inviteType === 'group' && (

              <FormControl fullWidth style={{ marginBottom: '16px' }}>
                <Select
                  multiple
                  value={newEvent.invitedGroups.map(group => group.groupName)}
                  onChange={handleChangeGroup}
                  input={<OutlinedInput label="Group Members" />}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>Select Group Members</em>;
                    }
                    return selected.join(', ');
                  }}
                  
                >
                  <MenuItem value="" disabled>
                    <em>Select Group Members</em>
                  </MenuItem>
                  {groups.map((group) => (
                    <MenuItem key={group.groupCode} value={group.groupName}>
                      <Checkbox checked={newEvent.invitedGroups.some(selectedGroup => selectedGroup.groupName === group.groupName)} />
                      <ListItemText primary={group.groupName} />
                    </MenuItem>
                  ))}
                </Select>
                {!!errors.invitedGroups && (
                <FormHelperText sx={{ color: 'red',}} >{errors.invitedGroups}</FormHelperText>
              )}
              </FormControl>

            )}

            <FormControlLabel
              control={
                <Switch
                  checked={newEvent.isPublic}
                  onChange={(e) => setNewEvent({ ...newEvent, isPublic: e.target.checked })}
                />
              }
              label="Public Event"
              style={{ marginBottom: '16px' }}
            />
            <Typography style={{ marginRight: '16px', color: 'gray' }}>Status</Typography>

            <FormControl fullWidth style={{ marginBottom: '16px' }}>
              <Select
                value={newEvent.status}
                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as 'SCHEDULED' | 'ONGOING' | 'POSTPONED' | 'CANCELLED' })}
                label="Status"
              >
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="ONGOING">Ongoing</MenuItem>
                <MenuItem value="POSTPONED">Postponed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>


            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleSave} variant="contained" color="primary">
                Save
              </Button>
              <Button onClick={() => setModalOpen(false)} variant="contained" color="secondary" style={{ marginLeft: '16px' }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <div style={{ height: '500px', marginTop: '20px' }}>

        <CalendarComponent />
      </div>
    </div>
  );
};

export default Calendar;
