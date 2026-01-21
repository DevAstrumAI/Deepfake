# Firebase Authentication Setup Checklist

## ⚠️ Current Error: `auth/configuration-not-found`

This error means Firebase Authentication is **NOT enabled** in your Firebase project. Follow these steps **exactly**:

---

## ✅ Step-by-Step Setup (Do ALL Steps)

### Step 1: Enable Firebase Authentication

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/
   - Sign in with your Google account
   - Select project: **`deepfake-631b6`**

2. **Navigate to Authentication**
   - Click **"Authentication"** in the left sidebar (under "Build")
   - If you see a **"Get started"** button, **CLICK IT**
   - If you see "Users" tab, Authentication is already initialized (skip to Step 2)

### Step 2: Enable Email/Password Sign-in Method

1. **In the Authentication page**, click on the **"Sign-in method"** tab (at the top)
2. **Find "Email/Password"** in the list of providers
3. **Click on "Email/Password"** (not the toggle, click the text)
4. **Toggle "Enable" to ON** (the switch should be blue/green)
5. **Click "Save"** button at the bottom
6. **Verify** it now shows "Enabled" next to Email/Password

### Step 3: Enable Required APIs in Google Cloud

1. **Go to Google Cloud Console**
   - Open: https://console.cloud.google.com/
   - Sign in with the **same Google account** used for Firebase
   - Select project: **`deepfake-631b6`** (use the dropdown at the top)

2. **Enable Identity Toolkit API**
   - Click **"APIs & Services"** → **"Library"** (in left sidebar)
   - Search for: **"Identity Toolkit API"**
   - Click on it
   - Click **"Enable"** button
   - Wait for it to enable (may take 30 seconds)

3. **Enable Firebase Authentication API** (if available)
   - Still in "APIs & Services" → "Library"
   - Search for: **"Firebase Authentication API"**
   - If found, click **"Enable"**

### Step 4: Check API Key Restrictions

1. **In Google Cloud Console**, go to **"APIs & Services"** → **"Credentials"**
2. **Find your API key**: `AIzaSyCzGFHi0zxcLMAK6H_glbTJNRqAp0hmDkE`
3. **Click on the API key** to edit it
4. **Check "API restrictions"**:
   - Should be **"Don't restrict key"** (recommended for now)
   - OR should include **"Identity Toolkit API"** in the list
5. **Check "Application restrictions"**:
   - Should be **"None"** (for web apps)
   - OR should include your domain (localhost, your deployed domain)
6. **Click "Save"** if you made changes

### Step 5: Verify Configuration

1. **Go back to Firebase Console**
2. **Go to Project Settings** (gear icon next to "Project Overview")
3. **Scroll down to "Your apps"** section
4. **Find your web app** (or create one if it doesn't exist)
5. **Verify the config** matches your `firebase/config.js`:
   - apiKey: `AIzaSyCzGFHi0zxcLMAK6H_glbTJNRqAp0hmDkE`
   - authDomain: `deepfake-631b6.firebaseapp.com`
   - projectId: `deepfake-631b6`

### Step 6: Add Authorized Domains (if needed)

1. **In Firebase Console**, go to **Authentication** → **Settings** tab
2. **Scroll to "Authorized domains"**
3. **Make sure these are listed**:
   - `localhost` (for local development)
   - `deepfake-631b6.firebaseapp.com`
   - Your deployed domain (if any)
4. **Add any missing domains** by clicking "Add domain"

### Step 7: Test

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. **Try signing up again**
4. **Check browser console** for any new errors

---

## 🔍 Verification Checklist

Before testing, verify ALL of these:

- [ ] Authentication is enabled in Firebase Console (you see "Users" tab)
- [ ] Email/Password shows as "Enabled" in Sign-in method tab
- [ ] Identity Toolkit API is enabled in Google Cloud Console
- [ ] API key has no restrictions OR includes Identity Toolkit API
- [ ] Your domain is in authorized domains list
- [ ] Firebase config matches Project Settings
- [ ] Browser cache is cleared

---

## 🐛 Still Not Working?

### Check 1: Verify Authentication is Actually Enabled

1. Go to Firebase Console → Authentication
2. You should see tabs: **"Users"**, **"Sign-in method"**, **"Settings"**
3. If you only see "Get started", click it first

### Check 2: Verify Email/Password is Enabled

1. Go to Authentication → Sign-in method tab
2. Find "Email/Password" in the list
3. It should show **"Enabled"** (not "Disabled")
4. If disabled, click it and enable it

### Check 3: Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try signing up
4. Look for the request to `identitytoolkit.googleapis.com`
5. Check the **Response** tab - it will show the exact error from Firebase

### Check 4: Verify Project ID

1. In Firebase Console, check your Project ID
2. It should be exactly: **`deepfake-631b6`**
3. If different, update your `firebase/config.js` file

### Check 5: Try Creating a New Web App

1. In Firebase Console → Project Settings
2. Scroll to "Your apps"
3. If no web app exists, click "Add app" → Web (</> icon)
4. Register the app with a nickname
5. Copy the new config and update `firebase/config.js`

---

## 📝 Common Mistakes

1. **Only enabling Authentication but not Email/Password method**
   - You must enable BOTH: Authentication service AND Email/Password sign-in method

2. **Not enabling Identity Toolkit API**
   - This API must be enabled in Google Cloud Console

3. **API key restrictions blocking the request**
   - Check API restrictions in Google Cloud Console

4. **Wrong project selected**
   - Make sure you're working in the correct Firebase/Google Cloud project

5. **Browser cache**
   - Old cached config might be causing issues

---

## 🆘 If Nothing Works

1. **Create a new Firebase project** (as a test)
2. **Enable Authentication** in the new project
3. **Enable Email/Password** sign-in method
4. **Get the new config** from Project Settings
5. **Update `firebase/config.js`** with the new config
6. **Test if it works** with the new project

If the new project works, there's an issue with your original project configuration.

---

## ✅ Success Indicators

When everything is set up correctly:

1. ✅ Authentication page shows "Users" tab (not "Get started")
2. ✅ Email/Password shows "Enabled" in Sign-in method
3. ✅ Identity Toolkit API shows "Enabled" in Google Cloud
4. ✅ Signup works without errors
5. ✅ New user appears in Authentication → Users tab

---

## 📞 Need More Help?

If you've completed ALL steps and it still doesn't work:

1. Take a screenshot of:
   - Firebase Console → Authentication → Sign-in method tab
   - Google Cloud Console → APIs & Services → Enabled APIs
   - Browser console error message

2. Check the exact error in Network tab → Response

3. Verify you're using the correct Google account for both Firebase and Google Cloud

