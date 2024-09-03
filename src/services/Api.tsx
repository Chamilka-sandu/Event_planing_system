import axios, { AxiosResponse } from 'axios';
import { Group, User } from './Apigroup';

const API_URL = 'http://localhost:8080/api/events';

export interface Event {
  eventId: number;
 
  inviteType: string;
  
  id?: number;  // Optional for create
  eventTitle: string;
  description: string;
  dateTime: Date;  // Ensure this matches the backend format (ISO string, etc.)
  venue: {
    address: string;
    latitude: number;
    longitude: number;
  };
  eventType: string;
  isPublic: boolean;
  status: 'SCHEDULED' | 'ONGOING' | 'POSTPONED' | 'CANCELLED';  // Ensure backend matches these values
  invitedGroups: Group[];  // Assuming these are group IDs
  invitedUsers:  User[];  // Assuming these are user IDs
}

// Fetch all events
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const response: AxiosResponse<Event[]> = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
};

// Fetch event by ID
export const getEventById = async (id: number): Promise<Event> => {
  try {
    const response: AxiosResponse<Event> = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${id}:`, error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (event: Event): Promise<Event> => {
  try {
    const response: AxiosResponse<Event> = await axios.post(API_URL, event);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (id: number, event: Partial<Event>): Promise<Event> => {
  try {
    const response: AxiosResponse<Event> = await axios.put(`${API_URL}/${id}`, event);
    return response.data;
  } catch (error) {
    console.error(`Error updating event with ID ${id}:`, error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting event with ID ${id}:`, error);
    throw error;
  }
};
