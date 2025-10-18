# 👤 User Profiles & Settings API Testing Guide

## 🚀 **Backend Implementation Complete!**

The User Profiles & Settings System backend is now fully implemented with comprehensive features:

### ✅ **Implemented Features**
- **Profile Management** - View, update user profiles with avatar customization
- **Settings Management** - Comprehensive settings for notifications, privacy, productivity
- **Friends System** - Complete friends management with requests and suggestions
- **User Search** - Search and discover other users
- **Avatar Customization** - Purchasable skins, accessories, and backgrounds
- **Statistics & Analytics** - Comprehensive profile statistics and goal tracking
- **Privacy Controls** - Granular privacy settings for profile visibility

---

## 🔗 **API Endpoints for Postman Testing**

### **Base URL**: `http://localhost:4000/api/profile`

### **Authentication Required**: All endpoints require Bearer token in Authorization header

---

## 👤 **1. Profile Management**

### **Get My Profile**
**GET** `/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "level": 5,
    "xp": 2150,
    "coins": 500,
    "streak": 7,
    "lastActiveDate": "2024-01-01T10:00:00.000Z",
    "avatarUrl": "https://example.com/avatar.jpg",
    "avatarCustomization": {
      "skin": "professional",
      "accessories": ["glasses", "watch"],
      "background": "office"
    },
    "achievements": ["first_task", "streak_master"],
    "friends": ["friend_id_1", "friend_id_2"],
    "friendRequests": {
      "sent": ["user_id_3"],
      "received": ["user_id_4"]
    },
    "settings": {
      "notifications": {
        "email": true,
        "push": true,
        "inApp": true,
        "taskReminders": true,
        "challengeUpdates": true,
        "achievementAlerts": true,
        "focusSessionAlerts": true
      },
      "theme": "auto",
      "language": "en",
      "timezone": "UTC",
      "privacy": {
        "profilePublic": true,
        "showInLeaderboard": true,
        "allowFriendRequests": true,
        "showOnlineStatus": true,
        "showStats": true
      },
      "productivity": {
        "workingHoursStart": "09:00",
        "workingHoursEnd": "17:00",
        "workingDays": [1, 2, 3, 4, 5],
        "dailyGoal": {
          "tasks": 5,
          "focusTime": 120,
          "xp": 200
        },
        "weeklyGoal": {
          "tasks": 25,
          "focusTime": 600,
          "xp": 1000
        }
      }
    },
    "stats": {
      "totalTasksCompleted": 45,
      "totalFocusTime": 1200,
      "longestStreak": 12,
      "averageTasksPerDay": 3.2
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### **Get User Profile by ID (Public View)**
**GET** `/users/:userId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Jane Smith",
    "level": 3,
    "xp": 1250,
    "avatarUrl": "https://example.com/avatar2.jpg",
    "avatarCustomization": {
      "skin": "casual",
      "accessories": ["hat"],
      "background": "nature"
    },
    "achievements": ["early_bird", "focus_master"],
    "stats": {
      "totalTasksCompleted": 28,
      "totalFocusTime": 800,
      "longestStreak": 8,
      "totalChallengesCompleted": 3
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isOnline": true,
    "lastActiveDate": "2024-01-01T09:55:00.000Z"
  }
}
```

### **Update Profile**
**PUT** `/me`

**Request Body:**
```json
{
  "name": "John Updated",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "avatarCustomization": {
    "skin": "creative",
    "accessories": ["glasses", "watch", "necklace"],
    "background": "space"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated profile data
  },
  "message": "Profile updated successfully"
}
```

---

## ⚙️ **2. Settings Management**

### **Update Settings**
**PUT** `/settings`

**Request Body:**
```json
{
  "notifications": {
    "email": false,
    "taskReminders": true,
    "focusSessionAlerts": false
  },
  "theme": "dark",
  "language": "es",
  "timezone": "America/New_York",
  "privacy": {
    "profilePublic": false,
    "showOnlineStatus": false,
    "allowFriendRequests": true
  },
  "productivity": {
    "workingHoursStart": "08:00",
    "workingHoursEnd": "16:00",
    "workingDays": [1, 2, 3, 4],
    "dailyGoal": {
      "tasks": 8,
      "focusTime": 180,
      "xp": 300
    },
    "weeklyGoal": {
      "tasks": 35,
      "focusTime": 900,
      "xp": 1500
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated profile with new settings
  },
  "message": "Settings updated successfully"
}
```

---

## 📊 **3. Profile Statistics**

### **Get Profile Statistics**
**GET** `/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "level": 5,
      "xp": 2150,
      "xpToNextLevel": 350,
      "coins": 500,
      "streak": 7,
      "totalAchievements": 12
    },
    "productivity": {
      "totalTasksCompleted": 45,
      "totalFocusTime": 1200,
      "averageProductivity": 85,
      "totalFocusSessions": 60,
      "completedFocusSessions": 52,
      "longestStreak": 12
    },
    "social": {
      "totalFriends": 8,
      "totalChallengesCompleted": 5,
      "leaderboardRank": 23
    },
    "activity": {
      "joinDate": "2024-01-01T00:00:00.000Z",
      "lastLoginDate": "2024-01-01T10:00:00.000Z",
      "totalLoginDays": 45,
      "averageTasksPerDay": 3.2
    },
    "goals": {
      "daily": {
        "tasks": { "completed": 3, "target": 5 },
        "focusTime": { "completed": 90, "target": 120 },
        "xp": { "completed": 150, "target": 200 }
      },
      "weekly": {
        "tasks": { "completed": 18, "target": 25 },
        "focusTime": { "completed": 420, "target": 600 },
        "xp": { "completed": 750, "target": 1000 }
      }
    }
  }
}
```

---

## 🔍 **4. User Search**

### **Search Users**
**GET** `/search`

**Query Parameters:**
- `query` - Search term for user names
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Sort field (`name` | `level` | `xp` | `createdAt`)
- `sortOrder` - Sort order (`asc` | `desc`)

**Example:** `/search?query=john&page=1&limit=10&sortBy=level&sortOrder=desc`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "John Smith",
        "level": 8,
        "xp": 3750,
        "avatarUrl": "https://example.com/avatar.jpg",
        "avatarCustomization": {
          "skin": "professional",
          "accessories": ["glasses"],
          "background": "office"
        },
        "achievements": ["master_achiever", "social_butterfly"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isOnline": true
      }
    ],
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

## 🎨 **5. Avatar Customization**

### **Get Available Customizations**
**GET** `/customizations`

**Response:**
```json
{
  "success": true,
  "data": {
    "skins": [
      {
        "id": "default",
        "name": "Default",
        "cost": 0,
        "unlocked": true
      },
      {
        "id": "professional",
        "name": "Professional",
        "cost": 150,
        "unlocked": false
      }
    ],
    "accessories": [
      {
        "id": "glasses",
        "name": "Glasses",
        "category": "eyewear",
        "cost": 50,
        "unlocked": true
      },
      {
        "id": "watch",
        "name": "Watch",
        "category": "accessories",
        "cost": 100,
        "unlocked": false
      }
    ],
    "backgrounds": [
      {
        "id": "default",
        "name": "Default",
        "cost": 0,
        "unlocked": true
      },
      {
        "id": "space",
        "name": "Space",
        "cost": 150,
        "unlocked": false
      }
    ]
  }
}
```

### **Purchase Customization**
**POST** `/customizations/purchase`

**Request Body:**
```json
{
  "type": "skin",
  "itemId": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "newBalance": 350
  },
  "message": "Customization purchased successfully"
}
```

---

## 👥 **6. Friends Management**

### **Get Friends List**
**GET** `/friends`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "friend_id",
      "name": "Alice Johnson",
      "level": 6,
      "xp": 2800,
      "avatarUrl": "https://example.com/alice.jpg",
      "avatarCustomization": {
        "skin": "casual",
        "accessories": ["hat"],
        "background": "nature"
      },
      "achievements": ["streak_master", "focus_guru"],
      "stats": {
        "totalTasksCompleted": 38,
        "totalFocusTime": 950,
        "longestStreak": 15,
        "totalChallengesCompleted": 4
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isOnline": false,
      "lastActiveDate": "2024-01-01T08:30:00.000Z"
    }
  ]
}
```

### **Send Friend Request**
**POST** `/friends/request`

**Request Body:**
```json
{
  "userId": "target_user_id",
  "message": "Hi! I'd like to be friends and compete in challenges together!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend request sent successfully"
}
```

### **Respond to Friend Request**
**PUT** `/friends/request`

**Request Body:**
```json
{
  "requestId": "requester_user_id",
  "action": "accept"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend request accepted successfully"
}
```

### **Remove Friend**
**DELETE** `/friends/:friendId`

**Response:**
```json
{
  "success": true,
  "message": "Friend removed successfully"
}
```

### **Get Pending Friend Requests**
**GET** `/friends/requests/pending`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "requester_id",
      "name": "Bob Wilson",
      "level": 4,
      "xp": 1800,
      "avatarUrl": "https://example.com/bob.jpg",
      "avatarCustomization": {
        "skin": "sporty",
        "accessories": [],
        "background": "default"
      },
      "achievements": ["early_bird"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isOnline": true
    }
  ]
}
```

### **Get Friend Suggestions**
**GET** `/friends/suggestions?limit=5`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "suggested_user_id",
      "name": "Carol Davis",
      "level": 7,
      "xp": 3200,
      "avatarUrl": "https://example.com/carol.jpg",
      "avatarCustomization": {
        "skin": "creative",
        "accessories": ["necklace"],
        "background": "abstract"
      },
      "achievements": ["productivity_master", "challenge_champion"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Complete Profile Setup**
1. **Get Profile**: GET `/me` to see current profile
2. **Update Profile**: PUT `/me` with new name and avatar
3. **Update Settings**: PUT `/settings` with preferences
4. **View Stats**: GET `/stats` to see updated statistics

### **Scenario 2: Avatar Customization**
1. **View Available Items**: GET `/customizations`
2. **Purchase Item**: POST `/customizations/purchase` with skin/accessory
3. **Update Avatar**: PUT `/me` with new customization
4. **Verify Purchase**: GET `/customizations` to see unlocked items

### **Scenario 3: Friends Management**
1. **Search Users**: GET `/search?query=john`
2. **Send Friend Request**: POST `/friends/request`
3. **View Pending Requests**: GET `/friends/requests/pending`
4. **Accept Request**: PUT `/friends/request` with accept action
5. **View Friends**: GET `/friends`

### **Scenario 4: Privacy & Settings**
1. **Update Privacy**: PUT `/settings` with privacy settings
2. **Test Public Profile**: GET `/users/:userId` (should respect privacy)
3. **Update Productivity Goals**: PUT `/settings` with new goals
4. **View Goal Progress**: GET `/stats` to see goal tracking

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
- `400` - Bad Request (validation errors, insufficient coins, etc.)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (user/profile doesn't exist)
- `500` - Internal Server Error

---

## 🎮 **Key Features Implemented**

### **Profile Management**
- Complete profile CRUD operations
- Avatar customization with purchasable items
- Comprehensive user statistics
- Privacy controls and settings

### **Friends System**
- Send/accept/decline friend requests
- Friends list management
- Friend suggestions based on activity
- Mutual friends discovery

### **Settings Management**
- Notification preferences (email, push, in-app)
- Theme and language settings
- Privacy controls (profile visibility, online status)
- Productivity goals and working hours

### **User Discovery**
- Search users by name
- Filter and sort results
- Respect privacy settings
- Public profile views

---

## 🚀 **Ready for Frontend Integration!**

The backend is fully functional and ready for Postman testing. Once you've verified all endpoints work correctly, we can proceed with the frontend implementation!

**Next Steps:**
1. Test all profile management endpoints
2. Verify friends system functionality
3. Test avatar customization and coin spending
4. Confirm privacy settings work correctly
5. Test search and discovery features
6. Proceed to frontend development
