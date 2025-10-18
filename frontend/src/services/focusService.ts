import { apiService } from './api';
import type {
  FocusSession,
  CreateFocusSessionRequest,
  UpdateFocusSessionRequest,
  FocusSessionFilters,
  FocusSessionsResponse,
  FocusStats,
  FocusSettings,
  UpdateFocusSettingsRequest,
  StartFocusSessionResponse,
  CompleteFocusSessionResponse,
} from '../types/focus';

class FocusService {
  // Start a new focus session
  async startFocusSession(sessionData: CreateFocusSessionRequest): Promise<StartFocusSessionResponse> {
    const response = await apiService.post<StartFocusSessionResponse>('/focus/start', sessionData);
    return response.data.data!;
  }

  // Get focus sessions with filters
  async getFocusSessions(filters: FocusSessionFilters = {}): Promise<FocusSessionsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/focus/sessions?${queryString}` : '/focus/sessions';
    
    const response = await apiService.get<any>(url);
    
    return {
      sessions: response.data.data?.sessions || [],
      pagination: response.data.data?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    };
  }

  // Get active focus session
  async getActiveFocusSession(): Promise<FocusSession | null> {
    const response = await apiService.get<FocusSession>('/focus/sessions/active');
    return response.data.data || null;
  }

  // Get focus session by ID
  async getFocusSessionById(sessionId: string): Promise<FocusSession> {
    const response = await apiService.get<FocusSession>(`/focus/sessions/${sessionId}`);
    return response.data.data!;
  }

  // Update focus session
  async updateFocusSession(sessionId: string, updateData: UpdateFocusSessionRequest): Promise<FocusSession> {
    const response = await apiService.put<FocusSession>(`/focus/sessions/${sessionId}`, updateData);
    return response.data.data!;
  }

  // Complete focus session
  async completeFocusSession(sessionId: string): Promise<CompleteFocusSessionResponse> {
    const response = await apiService.post<CompleteFocusSessionResponse>(`/focus/sessions/${sessionId}/complete`);
    return response.data.data!;
  }

  // Delete focus session
  async deleteFocusSession(sessionId: string): Promise<void> {
    await apiService.delete(`/focus/sessions/${sessionId}`);
  }

  // Get focus statistics
  async getFocusStats(): Promise<FocusStats> {
    const response = await apiService.get<FocusStats>('/focus/stats');
    return response.data.data!;
  }

  // Get focus settings
  async getFocusSettings(): Promise<FocusSettings> {
    const response = await apiService.get<FocusSettings>('/focus/settings');
    return response.data.data!;
  }

  // Update focus settings
  async updateFocusSettings(settings: UpdateFocusSettingsRequest): Promise<FocusSettings> {
    const response = await apiService.put<FocusSettings>('/focus/settings', settings);
    return response.data.data!;
  }

  // Helper methods for client-side calculations
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  calculateProductivityColor(productivity: number): string {
    if (productivity >= 80) return 'text-green-600';
    if (productivity >= 60) return 'text-yellow-600';
    if (productivity >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  getProductivityLabel(productivity: number): string {
    if (productivity >= 90) return 'Excellent';
    if (productivity >= 80) return 'Great';
    if (productivity >= 70) return 'Good';
    if (productivity >= 60) return 'Fair';
    if (productivity >= 40) return 'Poor';
    return 'Very Poor';
  }

  // Get sessions for today
  async getTodaysSessions(): Promise<FocusSession[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    const result = await this.getFocusSessions({
      startDate: startOfDay,
      endDate: endOfDay,
      limit: 100,
      sortBy: 'startTime',
      sortOrder: 'asc'
    });
    
    return result.sessions;
  }

  // Get recent sessions
  async getRecentSessions(limit: number = 10): Promise<FocusSession[]> {
    const result = await this.getFocusSessions({
      limit,
      sortBy: 'startTime',
      sortOrder: 'desc'
    });
    
    return result.sessions;
  }

  // Get sessions by type
  async getSessionsByType(type: 'pomodoro' | 'custom'): Promise<FocusSession[]> {
    const result = await this.getFocusSessions({
      type,
      limit: 100,
      sortBy: 'startTime',
      sortOrder: 'desc'
    });
    
    return result.sessions;
  }

  // Calculate streak from sessions
  calculateStreakFromSessions(sessions: FocusSession[]): number {
    if (sessions.length === 0) return 0;

    const completedSessions = sessions.filter(s => s.completed);
    if (completedSessions.length === 0) return 0;

    // Group sessions by date
    const sessionsByDate = new Map<string, boolean>();
    completedSessions.forEach(session => {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      sessionsByDate.set(date, true);
    });

    // Calculate streak
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    // If no sessions today, start from yesterday
    const todayStr = today.toISOString().split('T')[0];
    if (!sessionsByDate.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count consecutive days
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sessionsByDate.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}

export const focusService = new FocusService();
export default focusService;
