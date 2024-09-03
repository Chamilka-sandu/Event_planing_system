import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField, FormControl, Select, MenuItem, FormControlLabel, Switch, RadioGroup, Radio, ListItemText, Checkbox, OutlinedInput, Typography } from '@mui/material';
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
  eventType: string;
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
    eventType: 'Conference',
    isPublic: false,
    status: 'SCHEDULED',
    inviteType: 'group',

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
    if (!newEvent.eventTitle) tempErrors.eventTitle = 'Event title is required';
    // if (!newEvent.start) tempErrors.start = 'Start date and time is required';
    // if (newEvent.start < new Date()) tempErrors.start = 'Start date and time cannot be in the past';
    // if (!newEvent.end) tempErrors.end = 'End date and time is required';
    // if (newEvent.end <= newEvent.start) tempErrors.end = 'End date and time must be after start date and time';
    if (!newEvent.venue.address) tempErrors.venue = 'Venue is required';
    // if (newEvent.attendees.length === 0) tempErrors.attendees = 'At least one attendee/group is required';

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

  // const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
  //   if (slotInfo.start < new Date()) {
  //     alert("You cannot create an event for past dates.");
  //     return;
  //   }
  //   setNewEvent({ ...newEvent, start: slotInfo.start, end: slotInfo.end });
  //   setModalOpen(true);
  // };

  const handleSelectEvent = (event: APIEvent) => {
    alert(`Event: ${event.eventTitle}`);
  };

  const handleSave = async () => {
    debugger

    try {
      const savedEvent = await createEvent(newEvent);
      setEvents([...events, savedEvent]);
      setModalOpen(false);
      console.log("Event created successfully", savedEvent);
    } catch (error) {
      console.error('Error creating event:', error);
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
      {/* <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
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
              error={!!errors.start}
              helperText={errors.start}
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="Address"
              value={newEvent.venue.address}
              onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, address: e.target.value } })}
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="Latitude"
              type="number"
              value={newEvent.venue.latitude}
              onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, latitude: Number(e.target.value) } })}
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="Longitude"
              type="number"
              value={newEvent.venue.longitude}
              onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, longitude: Number(e.target.value) } })}
              style={{ marginBottom: '16px' }}
            />


            <FormControl fullWidth style={{ marginBottom: '16px' }}>
              <Select
              placeholder='Select Invite Type'
                value={newEvent.inviteType}
                onChange={(e) => setNewEvent({ ...newEvent, inviteType: e.target.value as 'group' | 'individual' })}
              >
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
              </Select>
            </FormControl>

            {newEvent.inviteType === 'individual' && (
              <FormControl fullWidth style={{ marginBottom: '16px' }}>
                <Select
                placeholder='Select Users'
                  multiple
                  value={newEvent.invitedUsers.map(member => member.userName)}
                  onChange={handleChangeMembers}
                  input={<OutlinedInput label="users" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {users.map((user) => (
                    <MenuItem key={user.userId} value={user.userName}>
                      <Checkbox checked={newEvent.invitedUsers.some(member => member.userName === user.userName)} />
                      <ListItemText primary={user.userName} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {newEvent.inviteType === 'group' && (
              <FormControl fullWidth style={{ marginBottom: '16px' }}>
                <Select
                placeholder='Select Group Members'
                  multiple
                  value={newEvent.invitedGroups.map(group => group.groupName)}
                  onChange={handleChangeGroup}
                  input={<OutlinedInput label="Group Members" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.groupCode} value={group.groupName}>
                      <Checkbox checked={newEvent.invitedGroups.some(selectedGroup => selectedGroup.groupName === group.groupName)} />
                      <ListItemText primary={group.groupName} />
                    </MenuItem>
                  ))}
                </Select>
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
            <FormControl component="fieldset" style={{ marginBottom: '16px' }}>
              <RadioGroup
                value={newEvent.status}
                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as 'SCHEDULED' | 'ONGOING' | 'POSTPONED' | 'CANCELLED' })}
              >
                <FormControlLabel value="SCHEDULED" control={<Radio />} label="Scheduled" />
                <FormControlLabel value="ONGOING" control={<Radio />} label="Ongoing" />
                <FormControlLabel value="POSTPONED" control={<Radio />} label="Postponed" />
                <FormControlLabel value="CANCELLED" control={<Radio />} label="Cancelled" />
              </RadioGroup>
            </FormControl>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
            <Button onClick={() => setModalOpen(false)} variant="contained" color="secondary" style={{ marginLeft: '16px' }}>
              Cancel
            </Button>
          </form>
        </div>
      </Modal> */}

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
              error={!!errors.start}
              helperText={errors.start}
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="Address"
              fullWidth
              value={newEvent.venue.address}
              onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, address: e.target.value } })}
              style={{ marginBottom: '16px' }}
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

            {/* <FormControl fullWidth style={{ marginBottom: '16px' }}>
              <Select
                value={newEvent.inviteType}
                onChange={(e) => setNewEvent({ ...newEvent, inviteType: e.target.value as 'group' | 'individual' })}
              >
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
              </Select>
            </FormControl> */}
            <FormControl fullWidth style={{ marginBottom: '16px' }}>
              <Select
                value={newEvent.inviteType || ""}
                onChange={(e) => setNewEvent({ ...newEvent, inviteType: e.target.value as 'group' | 'individual' })}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>Select Invite Type</em>;
                  }
                  return selected.charAt(0).toUpperCase() + selected.slice(1);
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select Invite Type</em>
                </MenuItem>
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
              </Select>
            </FormControl>


            {newEvent.inviteType === 'individual' && (
              // <FormControl fullWidth style={{ marginBottom: '16px' }}>
              //   <Select

              //     multiple
              //     value={newEvent.invitedUsers.map(member => member.userName)}
              //     onChange={handleChangeMembers}
              //     input={<OutlinedInput label="Users" />}
              //     renderValue={(selected) => selected.join(', ')}
              //   >
              //     {users.map((user) => (
              //       <MenuItem key={user.userId} value={user.userName}>
              //         <Checkbox checked={newEvent.invitedUsers.some(member => member.userName === user.userName)} />
              //         <ListItemText primary={user.userName} />
              //       </MenuItem>
              //     ))}
              //   </Select>
              // </FormControl>
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
              </FormControl>

            )}

            {newEvent.inviteType === 'group' && (
              //         <FormControl fullWidth style={{ marginBottom: '16px' }}>
              //           <Select
              //             multiple
              //             value={newEvent.invitedGroups.map(group => group.groupName)}
              //             onChange={handleChangeGroup}
              //             input={<OutlinedInput label="Group Members" />}
              //             renderValue={(selected) => selected.join(', ')}

              //           >
              //             <MenuItem value="" disabled>
              //   <em>Select Group Members</em>
              // </MenuItem>
              //             {groups.map((group) => (
              //               <MenuItem key={group.groupCode} value={group.groupName}>
              //                 <Checkbox checked={newEvent.invitedGroups.some(selectedGroup => selectedGroup.groupName === group.groupName)} />
              //                 <ListItemText primary={group.groupName} />
              //               </MenuItem>
              //             ))}
              //           </Select>
              //         </FormControl>
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

            <FormControl component="fieldset" style={{ marginBottom: '16px' }}>
              <RadioGroup
                value={newEvent.status}
                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as 'SCHEDULED' | 'ONGOING' | 'POSTPONED' | 'CANCELLED' })}
              >
                <FormControlLabel value="SCHEDULED" control={<Radio />} label="Scheduled" />
                <FormControlLabel value="ONGOING" control={<Radio />} label="Ongoing" />
                <FormControlLabel value="POSTPONED" control={<Radio />} label="Postponed" />
                <FormControlLabel value="CANCELLED" control={<Radio />} label="Cancelled" />
              </RadioGroup>
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
