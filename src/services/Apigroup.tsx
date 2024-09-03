import axios from 'axios';

// Define the base URL for the API
const BASE_URL = 'http://localhost:8080/api/groups'; // Adjust the base URL as needed

// Type definitions
export interface User {
  userId: string;
  userName: string;
}

export interface Group {
  id?: number;
  groupName: string;
  groupCode: string;
  status: boolean;
  groupType: string;
  groupMembers: User[];
}

// Create a new group
export const createGroup = async (group: Group): Promise<Group> => {
  const response = await axios.post(BASE_URL, group);
  return response.data;
};

// Retrieve all groups
export const getAllGroups = async (): Promise<Group[]> => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

// Retrieve a group by its ID
export const getGroupById = async (id: number): Promise<Group> => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const editGroup = async (groupId: number, groupData: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/${groupId}`, groupData);
    return response.data;
  } catch (error) {
    console.error("Failed to edit group", error);
    throw error;
  }
};

// Delete a group by its ID
export const deleteGroup = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
};
