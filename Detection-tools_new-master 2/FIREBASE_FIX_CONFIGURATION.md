# Fix Firebase Configuration Error

## Error: `auth/configuration-not-found`

This error means Firebase Authentication is not properly set up in your Firebase project.

## Step-by-Step Fix

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `deepfake-631b6`
3. Click on **"Authentication"** in the left sidebar
4. If you see "Get started", click it
5. If Authentication is already set up, proceed to step 2

### 2. Enable Email/Password Sign-in Method

1. In the Authentication page, click on the **"Sign-in method"** tab
2. Find **"Email/Password"** in the list of providers
3. Click on **"Email/Password"**
4. Toggle **"Enable"** to **ON**
5. Click **"Save"**

### 3. Verify Your Firebase Config

Make sure your `firebase/config.js` file has the correct configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCzGFHi0zxcLMAK6H_glbTJNRqAp0hmDkE",
  authDomain: "deepfake-631b6.firebaseapp.com",
  projectId: "deepfake-631b6",
  storageBucket: "deepfake-631b6.firebasestorage.app",
  messagingSenderId: "1041161394360",
  appId: "1:1041161394360:web:c184d5e0e83d2b675ffc4d",
  measurementId: "G-DP0ZR6ZT65"
};
```

### 4. Check API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `deepfake-631b6`
3. Go to **APIs & Services** > **Credentials**
4. Find your API key: `AIzaSyCzGFHi0zxcLMAK6H_glbTJNRqAp0hmDkE`
5. Check **"API restrictions"**:
   - Should be **"Don't restrict key"** OR
   - Should include **"Identity Toolkit API"**
6. Check **"Application restrictions"**:
   - Should be **"None"** for web apps OR
   - Should include your domain

### 5. Enable Required APIs

Make sure these APIs are enabled in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `deepfake-631b6`
3. Go to **APIs & Services** > **Library**
4. Search for and enable:
   - **Identity Toolkit API** (required for Authentication)
   - **Firebase Authentication API**

### 6. Verify Project Settings

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Make sure your web app is registered
4. Verify the configuration matches your `firebase/config.js`

### 7. Check Browser Console

After making changes:
1. Clear your browser cache
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Try signing up again
4. Check the browser console for any new errors

## Common Issues

### Issue 1: API Key Not Valid
**Solution**: Regenerate your API key in Firebase Console > Project Settings > Your apps

### Issue 2: Domain Not Authorized
**Solution**: Add your domain to authorized domains in Firebase Console > Authentication > Settings > Authorized domains

### Issue 3: CORS Errors
**Solution**: Add your domain to Firebase authorized domains

### Issue 4: Project Not Found
**Solution**: Verify the `projectId` in your config matches your Firebase project ID

## Testing

After completing the steps above:

1. Try creating a new account
2. Check the browser console for errors
3. Verify the user appears in Firebase Console > Authentication > Users

## Still Having Issues?

If the error persists:

1. **Double-check Email/Password is enabled**: Go to Authentication > Sign-in method and verify Email/Password shows as "Enabled"
2. **Check API restrictions**: Make sure your API key isn't restricted
3. **Verify project ID**: Ensure `projectId: "deepfake-631b6"` is correct
4. **Check network tab**: Look at the actual request being sent and the response
5. **Try a different browser**: Rule out browser-specific issues

## Quick Checklist

- [ ] Authentication is enabled in Firebase Console
- [ ] Email/Password sign-in method is enabled
- [ ] API key has no restrictions OR includes Identity Toolkit API
- [ ] Identity Toolkit API is enabled in Google Cloud Console
- [ ] Firebase config matches your project settings
- [ ] Browser cache is cleared
- [ ] Domain is in authorized domains list

