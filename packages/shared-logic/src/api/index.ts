// API client for backend
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5167') {
    this.baseUrl = baseUrl;
  }

  async getMeetings(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/meetings`);
    return response.json();
  }

  async getMeeting(id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/meetings/${id}`);
    return response.json();
  }

  async createMeeting(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateMeeting(id: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/meetings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteMeeting(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/meetings/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
