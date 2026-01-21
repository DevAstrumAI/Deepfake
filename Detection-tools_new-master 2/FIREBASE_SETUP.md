# Firebase Authentication Setup Guide

## Enable Email/Password Authentication

The 400 Bad Request error you're seeing is likely because Email/Password authentication is not enabled in your Firebase project. Follow these steps to enable it:

### Steps:

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project: `deepfake-631b6`

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - If you haven't set up Authentication before, click "Get started"

3. **Enable Email/Password Sign-in**
   - Click on the "Sign-in method" tab
   - Find "Email/Password" in the list
   - Click on it to open settings
   - Toggle "Enable" to ON
   - Click "Save"

4. **Optional: Email Verification**
   - You can also enable "Email link (passwordless sign-in)" if desired
   - For now, just enable the basic "Email/Password" option

### Verify Setup

After enabling Email/Password authentication, try signing up again. The error should be resolved.

### Common Error Messages:

- **"operation-not-allowed"**: Email/Password authentication is not enabled
- **"email-already-in-use"**: The email is already registered
- **"weak-password"**: Password is too weak (must be at least 6 characters)
- **"invalid-email"**: The email format is invalid

### Testing

Once enabled, you should be able to:
- Create new accounts via the signup page
- Log in with existing accounts via the login page
- Access the upload section after authentication

