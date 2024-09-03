import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Modal, TextField, FormControl, Select, MenuItem, FormControlLabel,
  Switch, RadioGroup, Radio, Checkbox, ListItemText, OutlinedInput, tableCellClasses, styled, IconButton,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link, useParams } from 'react-router-dom';
import { deleteEvent, getAllEvents, getEventById, updateEvent } from '../services/Api';
import { format } from 'date-fns';
import { fetchUsers } from '../services/Apiusers';
import { getAllGroups } from '../services/Apigroup';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#2196f3',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));
interface Event {
  id?: number;
  eventTitle: string;
  dateTime: string;
  venue: Venue | null;
  eventType: string;
  status: string;
  description?: string;
  inviteType?: 'group' | 'individual';
  invitedUsers?: User[];
  invitedGroups?: Group[];
  isPublic?: boolean;
}
interface ApiEvent {
  id?: number;
  eventTitle: string;
  dateTime: string;
  venue: Venue | null;
  eventType: string;
  status: string;
  description?: string;
  inviteType?: 'group' | 'individual';
  invitedUsers?: User[];
  invitedGroups?: Group[];
  isPublic?: boolean;
}
interface Venue {
  address?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any; // Allow dynamic properties
}

interface User {
  userId: string;
  userName: string;
}

interface Group {
  groupCode: string;
  groupName: string;
}

const API_BASE_URL = 'http://localhost:8080/api'; // Update with your actual base URL

const Dashboard: React.FC = () => {

  const [events, setEvents] = useState<Event[]>([]);
  const [event, setEvent] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    id: 0,
    eventTitle: '',
    description: '',
    dateTime: '', // Ensure this matches the expected type
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
  const [err, setErr] = useState<{
    eventTitle?: string;
    dateTime?: string;
    venueAddress?: string;
    inviteType?: string;
    invitedUsers?: string;
    invitedGroups?: string;
    form?: string;
  }>({});
  
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: {
      eventTitle?: string;
      dateTime?: string;
      venueAddress?: string;
      inviteType?: string;
      invitedUsers?: string;
      invitedGroups?: string;
      form?: string;
    } = {};
  
    // Validate Event Title
    if (!editEvent?.eventTitle.trim()) {
      newErrors.eventTitle = 'Event Title is required.';
    }
  
    // Validate Date & Time
    if (!editEvent?.dateTime) {
      newErrors.dateTime = 'Date & Time is required.';
    } else {
      const eventDate = new Date(editEvent.dateTime);
      const now = new Date();
      if (eventDate < now) {
        newErrors.dateTime = 'Date & Time cannot be in the past.';
      }
    }
  
    // Validate Venue Address
    if (!editEvent?.venue?.address) {
      newErrors.venueAddress = 'Venue Address is required.';
    }
  
    // Validate Invite Type and Selection
    if (!editEvent?.inviteType) {
      newErrors.inviteType = 'Invite Type is required.';
    } else if (editEvent.inviteType === 'individual') {
      if (!editEvent.invitedUsers || editEvent.invitedUsers.length === 0) {
        newErrors.invitedUsers = 'At least one user must be selected.';
      }
    } else if (editEvent.inviteType === 'group') {
      if (!editEvent.invitedGroups || editEvent.invitedGroups.length === 0) {
        newErrors.invitedGroups = 'At least one group must be selected.';
      }
    }
  
    // Additional Validations (if any)
    // Example: Validate Venue Coordinates
    if (editEvent?.venue?.latitude && isNaN(editEvent.venue.latitude)) {
      newErrors.form = 'Venue latitude must be a valid number.';
    }
    if (editEvent?.venue?.longitude && isNaN(editEvent.venue.longitude)) {
      newErrors.form = 'Venue longitude must be a valid number.';
    }
  
    setErr(newErrors);
  
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };
  
  const handleClickOpen = (eventId: number) => {
    setSelectedEventId(eventId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEventId(null);
  };

  const handleDelete = async () => {
    if (selectedEventId !== null) {
      try {
        await deleteEvent(selectedEventId);
        setEvents(events.filter(event => event.id !== selectedEventId));
        handleClose();
      } catch (error) {
        console.error('Error deleting event:', error);
        handleClose();
      }
    }
  };

  const updateEvent = async (id: number, event: Event) => {
    // Convert dateTime to ISO string before sending
    const eventToUpdate = {
      ...event,
      dateTime: new Date(event.dateTime).toISOString(), // Convert Date to string
    };

    // Make API call
    await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventToUpdate),
    });
  };


  const handleEditClick = async (eventId: number) => {
    try {
      const eventDetails = await getEventById(eventId);

      // Check if dateTime is already a string, then create a Date object if necessary
      const dateTime = typeof eventDetails.dateTime === 'string'
        ? new Date(eventDetails.dateTime)
        : eventDetails.dateTime;

      const transformedEvent: Event = {
        ...eventDetails,
        dateTime: dateTime.toISOString(), // Convert Date to string
        inviteType: (eventDetails.inviteType === 'group' || eventDetails.inviteType === 'individual')
          ? eventDetails.inviteType
          : undefined, // Ensure inviteType is one of the expected values
      };
      setEditEvent(transformedEvent); // Set the event details to state for editing
      setModalOpen(true); // Open the modal for editing

    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };


  const handleCloseModal = () => {
    setModalOpen(false);
    setEditEvent(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { type, name, value } = e.target;
    if (editEvent) {
      // Handle nested fields like venue separately
      if (name.startsWith('venue.')) {
        const [_, field] = name.split('.');
        setEditEvent(prevEvent => {
          if (prevEvent) {
            // Ensure venue is defined
            const updatedVenue = prevEvent.venue ? { ...prevEvent.venue } : {};

            return {
              ...prevEvent,
              venue: {
                ...updatedVenue,
                [field]: value ?? updatedVenue[field] ?? "", // Use field safely
              },
              // Ensure other properties are not undefined
              eventTitle: prevEvent.eventTitle ?? "",
              dateTime: prevEvent.dateTime ?? "",
              eventType: prevEvent.eventType ?? "",
              // Other properties
            };

          } else {
            return null; // Return null if prevEvent is null
          }

        });
      }

      else {
        setEditEvent({
          ...editEvent,
          [name]: value,
        });
      }
      
    }
  }

  const handleSaveChanges = async () => {
    if (!editEvent) return;
    
     // Perform validation
  if (!validate()) {
    return; // Stop if validation fails
  }
    const updatedEvent = {
      ...editEvent,
      dateTime: new Date(editEvent.dateTime).toISOString(), // Ensure dateTime is a string
    };

    try {
      await updateEvent(updatedEvent.id!, updatedEvent); // Ensure the event has an ID
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
      );
      setModalOpen(false);
      setEditEvent(null);
      setErr({});
    } catch (error) {
      console.error('Error saving changes:', error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        form: 'Failed to save changes. Please try again.',
      }));
    }
  };

  const handleChangeMembers = (event: any) => {
    debugger
    const {
      target: { value },
    } = event;
    const selectedUsers = typeof value === 'string'
      ? value.split(',').map(userName => users.find(users => users.userName === userName)!)
      : value.map((userName: string) => users.find(users => users.userName === userName)!);

    console.log('Selected Users:', selectedUsers);


    setEditEvent(prevEvent => ({
      ...prevEvent,
      eventTitle: prevEvent?.eventTitle || '', // Ensure default values if needed
      dateTime: prevEvent?.dateTime || '',
      invitedUsers: selectedUsers,
    } as Event));
  };

  const handleChangeGroup = (event: any) => {
    debugger
    const {
      target: { value },
    } = event;
    const selectedGroups = typeof value === 'string'
      ? value.split(',').map(groupName => groups.find(groups => groups.groupName === groupName)!)
      : value.map((groupName: string) => groups.find(groups => groups.groupName === groupName)!);

    console.log('Selected grp:', selectedGroups);


    setEditEvent(prevEvent => ({
      ...prevEvent,
      eventTitle: prevEvent?.eventTitle || '', // Ensure default values if needed
      dateTime: prevEvent?.dateTime || '',
      invitedGroups: selectedGroups,
    } as Event));
  };
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        const parsedData = data.map((event: any) => ({
          ...event,
          dateTime: new Date(event.dateTime)

        }));
        setEvents(parsedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
        setGroups(groupsData);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups();
  }, []);


  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const totalEvents = events.length;
  const eventsByType = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventsByStatus = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventTypesData = Object.keys(eventsByType).map((type) => ({
    name: type,
    count: eventsByType[type],
  }));

  const eventStatusData = Object.keys(eventsByStatus).map((status) => ({
    name: status,
    count: eventsByStatus[status],
  }));

  const formattedDateTime = editEvent?.dateTime
    ? format(new Date(editEvent.dateTime), "yyyy-MM-dd'T'HH:mm")
    : ''; // Use an empty string if dateTime is invalid




  return (
    <div>
      <h3>Event Summary</h3>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700, marginTop: 2 }} aria-label="customized table">
          <TableHead>
            <TableRow >
              <StyledTableCell>Event Title</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Venue (Address)</StyledTableCell>
              <StyledTableCell>Event Type</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event, index) => (
              <StyledTableRow key={event.id}>
                <StyledTableCell>{event.eventTitle}</StyledTableCell>
                <StyledTableCell>{formatDate(event.dateTime)}</StyledTableCell>
                <StyledTableCell>{event.venue?.address || 'N/A'}</StyledTableCell>
                <StyledTableCell>{event.eventType}</StyledTableCell>
                <StyledTableCell>
                  <IconButton onClick={() => event.id !== undefined && handleEditClick(event.id)} color="primary" aria-label="edit"><EditIcon /></IconButton>
                  <IconButton onClick={() => event.id !== undefined && handleClickOpen(event.id)} color="secondary" aria-label="edit"><DeleteIcon /></IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h3>Statistics/Analytics</h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
        <ResponsiveContainer width="45%" height={300}>
          <BarChart data={eventTypesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="45%" height={300}>
          <LineChart data={eventStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>

      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="edit-event-modal"
        aria-describedby="edit-event-details"
      >
        <div style={{ padding: '20px', backgroundColor: 'white', margin: '50px auto', width: '80%', maxHeight: '90vh', overflowY: 'auto' }}>
          <h2>Edit Event</h2>
          {err.form && (
      <Typography color="error" variant="body2">
        {err.form}
      </Typography>
    )}
          <form>
            <TextField
              fullWidth
              name='eventTitle'
              value={editEvent?.eventTitle || ''}
              label="Event Title"
              onChange={handleInputChange}
              margin="normal"
              error={!!err.eventTitle}
              helperText={err.eventTitle}
            />
            <TextField
              fullWidth
              label="Description"
              name='description'
              multiline
              rows={4}
              value={editEvent?.description || ''}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              name='dateTime'
              label="Date Time"
              type="datetime-local"
              value={formattedDateTime} // Format the date correctly
              onChange={(e) => handleInputChange({ target: { name: 'dateTime', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!err.dateTime}
        helperText={err.dateTime}
            />

            <TextField
              fullWidth
              name='venue'
              label="Venue"
              value={editEvent?.venue?.address || ''}
              onChange={(e) => handleInputChange({ target: { name: 'venue.address', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
              margin="normal"
              error={!!err.venueAddress}
              helperText={err.venueAddress}
            />
            <Typography style={{ marginRight: '16px', color: 'gray' }}>Event Type</Typography>

            <FormControl fullWidth margin="normal">
              <Select
                name='eventType'
                value={editEvent?.eventType || ''}
                onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)}
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

            <FormControl component="fieldset" style={{ marginBottom: '16px' }}>
              <RadioGroup
                name="inviteType"
                value={editEvent?.inviteType || ''}
                onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>)}
                row
              >
                <FormControlLabel value="group" control={<Radio />} label="Group" />
                <FormControlLabel value="individual" control={<Radio />} label="Individual" />
              </RadioGroup>
            </FormControl>


            {editEvent?.inviteType === 'individual' && (
              <FormControl fullWidth style={{ marginBottom: '16px' }}>
                <Select
                  name='invitedUsers'
                  multiple
                  value={(editEvent?.invitedUsers?.map(member => member.userName)) || []}
                  input={<OutlinedInput label="Users" />}
                  renderValue={(selected) => selected.join(', ')}
                  onChange={handleChangeMembers}
                >
                  {users.map((user) => (
                    <MenuItem key={user.userId} value={user.userName}>
                      <Checkbox checked={editEvent.invitedUsers?.some(selectedUser => selectedUser.userName === user.userName)} />
                      <ListItemText primary={user.userName} />
                    </MenuItem>
                  ))}
                </Select>
                {errors.invitedUsers && <Typography color="error" variant="caption">{errors.invitedUsers}</Typography>}

              </FormControl>
            )}

            {editEvent?.inviteType === 'group' && (
              <FormControl fullWidth style={{ marginBottom: '16px' }}>
                <Select
                  name='invitedGroups'
                  multiple
                  value={(editEvent?.invitedGroups?.map(member => member.groupName)) || []}
                  input={<OutlinedInput label="Group Members" />}
                  renderValue={(selected) => selected.join(', ')}
                  onChange={handleChangeGroup}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.groupCode} value={group.groupName}>
                      <Checkbox checked={editEvent.invitedGroups?.some(selectedGroup => selectedGroup.groupName === group.groupName)} />
                      <ListItemText primary={group.groupName} />
                    </MenuItem>
                  ))}
                </Select>
                {errors.invitedGroups && <Typography color="error" variant="caption">{errors.invitedGroups}</Typography>}

              </FormControl>
            )}

            <FormControlLabel
              control={
                <Switch
                  name='editEvent'
                  checked={editEvent?.isPublic || false}
                  onChange={(e) => handleInputChange({ target: { name: 'isPublic', value: e.target.checked } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                />
              }
              label="Public Event"
            />

            <Typography style={{ marginRight: '10px', color: 'gray' }}>Status</Typography>
            <FormControl fullWidth style={{ marginBottom: '16px' }}>
              <Select
                name="status"
                value={editEvent?.status || ''}
                onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>Select Status</em>;
                  }
                  return selected.charAt(0).toUpperCase() + selected.slice(1).toLowerCase();
                }}
              >
                <MenuItem value=""><em>Select Status</em></MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="ONGOING">Ongoing</MenuItem>
                <MenuItem value="POSTPONED">Postponed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

            <Button onClick={handleSaveChanges} variant="contained" color="primary" style={{ marginTop: 20 }}>
              Save Changes
            </Button>
            <Button onClick={() => setModalOpen(false)} variant="contained" color="secondary" style={{ marginTop: 20, marginLeft: 10 }}>
              Cancel
            </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>

  );
};

export default Dashboard;
