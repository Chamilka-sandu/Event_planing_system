import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // Update with your actual base URL

export interface ApiEvent {
    eventId:number;
    eventTitle: string;
    description: string;
    start: Date | string | number;
    end: Date | string | number;
    dateTime: Date;
    venue: {
      address: string;
      latitude: number;
      longitude: number;
    };
    eventType: string;
    isPublic: boolean;
    status: string;
    inviteType: string;
    attendees: number[]; // Ensure this matches the API response
    invitedGroups: number[]; // Ensure this matches the API response
    invitedUsers: number[]; // Ensure this matches the API response
  }
  
  
  export const createEvent = async (event: Event) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/events`, event);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };
  
  export const getAllEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  };

 // Example API function
export const updateEvent = async (id: number, updatedEvent: Partial<Event>) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedEvent),
  });
  if (!response.ok) {
    throw new Error('Failed to update event');
  }
  return await response.json();
};

  
  // export const getEventById = async (id: number) => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/events/${id}`);
  //     return response.data; // Return the event data
  //   } catch (error) {
  //     console.error('Failed to fetch event:', error);
  //     throw error; // Throw the error to handle it in the calling component
  //   }
  // };
  export const getEventById = async (eventId: number): Promise<Event> => {
    const response = await fetch(`/api/events/${eventId}`);
    const data = await response.json();
  
    return {
      ...data,
      dateTime: new Date(data.dateTime).toISOString(), // Convert Date to string if needed
    };
  };
  

  // Delete an event
export const deleteEvent = async (id: number) => {
  try {
      await axios.delete(`${API_BASE_URL}/events/${id}`);
  } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
  }
};