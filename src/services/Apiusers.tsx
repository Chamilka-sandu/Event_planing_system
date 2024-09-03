import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:8080/api/users';

export const fetchUsers = async (): Promise<any[]> => {
    try {
        const response: AxiosResponse<any[]> = await axios.get(API_URL);
        return response.data;
    } catch (error: any) {
        throw new Error(`Fetching users failed: ${error.message}`);
    }
};

export const createUser = async (user: { userId: string, userName: string, email: string, role: string, status: string }): Promise<any> => {
    try {
        const response: AxiosResponse<any> = await axios.post(API_URL, user);
        return response.data;
    } catch (error: any) {
        throw new Error(`Creating user failed: ${error.message}`);
    }
};

