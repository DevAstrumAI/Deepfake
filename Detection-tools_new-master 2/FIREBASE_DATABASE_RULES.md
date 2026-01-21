# Firebase Database Security Rules

This document contains security rules for Firebase services. Choose the rules based on which database you're using.

## Firestore Security Rules

If you're using Firestore (NoSQL document database), use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analysis results - users can only access their own results
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // File metadata - users can only access their own files
    match /files/{fileId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Public read-only data (if needed)
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### How to Apply Firestore Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `deepfake-631b6`
3. Click on "Firestore Database" in the left sidebar
4. Go to the "Rules" tab
5. Paste the rules above
6. Click "Publish"

---

## Realtime Database Security Rules

If you're using Realtime Database (JSON database), use these rules:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "analyses": {
      "$analysisId": {
        ".read": "auth != null && data.child('userId').val() === auth.uid",
        ".write": "auth != null && data.child('userId').val() === auth.uid",
        ".validate": "newData.hasChildren(['userId', 'fileId', 'result']) && newData.child('userId').val() === auth.uid"
      }
    },
    "files": {
      "$fileId": {
        ".read": "auth != null && data.child('userId').val() === auth.uid",
        ".write": "auth != null && data.child('userId').val() === auth.uid",
        ".validate": "newData.hasChildren(['userId', 'filename', 'fileType']) && newData.child('userId').val() === auth.uid"
      }
    },
    "public": {
      ".read": true,
      ".write": false
    }
  }
}
```

### How to Apply Realtime Database Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `deepfake-631b6`
3. Click on "Realtime Database" in the left sidebar
4. Go to the "Rules" tab
5. Paste the rules above
6. Click "Publish"

---

## Storage Security Rules

If you're using Firebase Storage for file uploads, use these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
                   request.auth.uid == userId &&
                   request.resource.size < 100 * 1024 * 1024 && // 100MB limit
                   request.resource.contentType.matches('image/.*|video/.*|audio/.*');
    }
    
    // Analysis results - users can only access their own
    match /analyses/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Analysis results are read-only
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### How to Apply Storage Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `deepfake-631b6`
3. Click on "Storage" in the left sidebar
4. Go to the "Rules" tab
5. Paste the rules above
6. Click "Publish"

---

## Testing Rules

### Test Mode (Development Only)

For development, you can use these permissive rules (⚠️ **NEVER use in production**):

**Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Realtime Database:**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

**Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Important Security Notes

1. **Always require authentication**: All rules should check `request.auth != null` or `auth != null`
2. **User-specific data**: Users should only access their own data (`userId === auth.uid`)
3. **Validate data**: Use `.validate` rules to ensure data structure and ownership
4. **File size limits**: Set appropriate file size limits in Storage rules
5. **Content type validation**: Only allow specific file types (images, videos, audio)
6. **Never use test rules in production**: Test rules are too permissive for production use

---

## Common Rule Patterns

### Pattern 1: User owns the resource
```javascript
allow read, write: if request.auth != null && 
  resource.data.userId == request.auth.uid;
```

### Pattern 2: User can create with their own ID
```javascript
allow create: if request.auth != null && 
  request.resource.data.userId == request.auth.uid;
```

### Pattern 3: Public read, authenticated write
```javascript
allow read: if true;
allow write: if request.auth != null;
```

### Pattern 4: Time-based access
```javascript
allow read: if request.auth != null && 
  request.time < resource.data.expiresAt;
```

---

## Troubleshooting

### "Permission denied" errors
- Check that the user is authenticated (`request.auth != null`)
- Verify the user ID matches (`userId === auth.uid`)
- Ensure the data structure matches the rule expectations

### Rules not updating
- Clear browser cache
- Wait a few minutes for rules to propagate
- Check the Rules tab shows your latest changes

### Testing rules
- Use the Rules Playground in Firebase Console
- Test with different user scenarios
- Check the Rules tab for syntax errors

