# 🎯 Focus Mode & Pomodoro API Testing Guide

## 🚀 **Backend Implementation Complete!**

The Focus Mode & Pomodoro System backend is now fully implemented with the following features:

### ✅ **Implemented Features**
- **Focus Session Management** - Start, update, complete, delete sessions
- **Pomodoro & Custom Timers** - Support for both pomodoro and custom focus sessions
- **XP & Gamification** - Automatic XP calculation and achievement integration
- **Statistics & Analytics** - Comprehensive focus statistics and productivity tracking
- **Settings Management** - Customizable focus preferences
- **Progress Tracking** - Productivity scoring, interruption tracking, pause time
- **Task Integration** - Link focus sessions to specific tasks

---

## 🔗 **API Endpoints for Postman Testing**

### **Base URL**: `http://localhost:4000/api/focus`

### **Authentication Required**: All endpoints require Bearer token in Authorization header

---

## 📋 **1. Start Focus Session**
**POST** `/start`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "pomodoro",
  "duration": 25,
  "breakDuration": 5,
  "taskId": "optional_task_id",
  "notes": "Working on project documentation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "_id": "session_id",
      "userId": "user_id",
      "type": "pomodoro",
      "duration": 25,
      "actualDuration": 0,
      "breakDuration": 5,
      "completed": false,
      "interruptions": 0,
      "taskId": "task_id",
      "xpEarned": 0,
      "productivity": 0,
      "startTime": "2024-01-01T10:00:00.000Z",
      "pausedTime": 0,
      "notes": "Working on project documentation",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    },
    "message": "Focus session started successfully"
  }
}
```

---

## 📊 **2. Get Focus Sessions**
**GET** `/sessions`

**Query Parameters:**
- `type` - Filter by session type (`pomodoro` | `custom`)
- `completed` - Filter by completion status (`true` | `false`)
- `taskId` - Filter by linked task ID
- `startDate` - Filter sessions after this date (ISO string)
- `endDate` - Filter sessions before this date (ISO string)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Sort field (`startTime` | `duration` | `productivity` | `createdAt`)
- `sortOrder` - Sort order (`asc` | `desc`)

**Example:** `/sessions?type=pomodoro&completed=true&page=1&limit=10&sortBy=startTime&sortOrder=desc`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

## 🎯 **3. Get Active Focus Session**
**GET** `/sessions/active`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "session_id",
    "type": "pomodoro",
    "duration": 25,
    "actualDuration": 15,
    "completed": false,
    "startTime": "2024-01-01T10:00:00.000Z",
    ...
  }
}
```

---

## 🔍 **4. Get Focus Session by ID**
**GET** `/sessions/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "session_id",
    "userId": "user_id",
    "type": "pomodoro",
    "duration": 25,
    "actualDuration": 25,
    "completed": true,
    "productivity": 85,
    "xpEarned": 42,
    ...
  }
}
```

---

## ✏️ **5. Update Focus Session**
**PUT** `/sessions/:id`

**Request Body:**
```json
{
  "actualDuration": 20,
  "interruptions": 2,
  "pausedTime": 3,
  "notes": "Had some interruptions but stayed focused"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "session_id",
    "actualDuration": 20,
    "interruptions": 2,
    "pausedTime": 3,
    "productivity": 75,
    ...
  },
  "message": "Focus session updated successfully"
}
```

---

## ✅ **6. Complete Focus Session**
**POST** `/sessions/:id/complete`

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "_id": "session_id",
      "completed": true,
      "endTime": "2024-01-01T10:25:00.000Z",
      "productivity": 85,
      "xpEarned": 42,
      ...
    },
    "xpEarned": 42,
    "newAchievements": ["focus_master", "consistency_hero"],
    "message": "Focus session completed successfully"
  }
}
```

---

## 🗑️ **7. Delete Focus Session**
**DELETE** `/sessions/:id`

**Response:**
```json
{
  "success": true,
  "message": "Focus session deleted successfully"
}
```

---

## 📈 **8. Get Focus Statistics**
**GET** `/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 45,
    "completedSessions": 38,
    "totalFocusTime": 950,
    "averageSessionLength": 25,
    "averageProductivity": 82,
    "completionRate": 84,
    "totalXpEarned": 1580,
    "longestSession": 60,
    "currentStreak": 7,
    "todaysSessions": 3,
    "thisWeekSessions": 18,
    "thisMonthSessions": 45,
    "categoryBreakdown": {
      "pomodoro": 35,
      "custom": 10
    },
    "productivityTrend": [
      {
        "date": "2024-01-01",
        "productivity": 85,
        "sessions": 4
      },
      ...
    ]
  }
}
```

---

## ⚙️ **9. Get Focus Settings**
**GET** `/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "defaultPomodoroLength": 25,
    "defaultBreakLength": 5,
    "defaultLongBreakLength": 15,
    "pomodorosUntilLongBreak": 4,
    "autoStartBreaks": false,
    "autoStartPomodoros": false,
    "soundEnabled": true,
    "notificationsEnabled": true,
    "xpMultiplier": 1.0
  }
}
```

---

## 🔧 **10. Update Focus Settings**
**PUT** `/settings`

**Request Body:**
```json
{
  "defaultPomodoroLength": 30,
  "defaultBreakLength": 10,
  "autoStartBreaks": true,
  "soundEnabled": false,
  "xpMultiplier": 1.2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "defaultPomodoroLength": 30,
    "defaultBreakLength": 10,
    "defaultLongBreakLength": 15,
    "pomodorosUntilLongBreak": 4,
    "autoStartBreaks": true,
    "autoStartPomodoros": false,
    "soundEnabled": false,
    "notificationsEnabled": true,
    "xpMultiplier": 1.2
  },
  "message": "Focus settings updated successfully"
}
```

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Complete Pomodoro Workflow**
1. **Start Session**: POST `/start` with pomodoro type
2. **Check Active**: GET `/sessions/active` to verify session is running
3. **Update Progress**: PUT `/sessions/:id` to add interruptions/pauses
4. **Complete Session**: POST `/sessions/:id/complete` to finish and earn XP
5. **View Stats**: GET `/stats` to see updated statistics

### **Scenario 2: Custom Focus Session**
1. **Start Custom Session**: POST `/start` with `type: "custom"` and `duration: 45`
2. **Link to Task**: Include `taskId` in the request body
3. **Track Progress**: Update session with actual duration and productivity
4. **Complete**: Finish session and check XP earned

### **Scenario 3: Settings Management**
1. **Get Current Settings**: GET `/settings`
2. **Update Preferences**: PUT `/settings` with new values
3. **Verify Changes**: GET `/settings` again to confirm updates

### **Scenario 4: Analytics & Reporting**
1. **Create Multiple Sessions**: Start and complete several sessions
2. **View Statistics**: GET `/stats` to see comprehensive analytics
3. **Filter Sessions**: GET `/sessions` with various filters
4. **Check Productivity Trends**: Analyze the productivity trend data

---

## 🔍 **Error Handling**

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (for starting sessions)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (session doesn't exist)
- `500` - Internal Server Error

---

## 🎮 **XP Calculation Formula**

```javascript
// Base XP: 5 XP per minute of actual focus time
// Completion Bonus: +20 XP for completing session
// Type Multiplier: Pomodoro (1.2x), Custom (1.0x)
// Duration Bonus: Sessions ≥25 min get 1.1x multiplier
// Productivity Factor: Based on productivity score (0-100%)

totalXP = (5 * actualDuration * typeMultiplier * durationMultiplier * productivityFactor) + completionBonus
```

---

## 🚀 **Ready for Frontend Integration!**

The backend is fully functional and ready for Postman testing. Once you've verified all endpoints work correctly, we can proceed with the frontend implementation!

**Next Steps:**
1. Test all endpoints in Postman
2. Verify XP calculation and achievement integration
3. Test error scenarios and edge cases
4. Confirm statistics and analytics accuracy
5. Proceed to frontend development
