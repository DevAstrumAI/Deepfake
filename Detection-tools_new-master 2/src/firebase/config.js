/** @format */

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyCzGFHi0zxcLMAK6H_glbTJNRqAp0hmDkE',
	authDomain: 'deepfake-631b6.firebaseapp.com',
	projectId: 'deepfake-631b6',
	storageBucket: 'deepfake-631b6.firebasestorage.app',
	messagingSenderId: '1041161394360',
	appId: '1:1041161394360:web:c184d5e0e83d2b675ffc4d',
	measurementId: 'G-DP0ZR6ZT65',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Verify Firebase is initialized correctly
if (process.env.NODE_ENV === 'development') {
	console.log('Firebase initialized with config:', {
		projectId: firebaseConfig.projectId,
		authDomain: firebaseConfig.authDomain,
	});
	
	// Test auth initialization
	auth.onAuthStateChanged((user) => {
		if (user) {
			console.log('Firebase Auth: User logged in', user.email);
		} else {
			console.log('Firebase Auth: No user logged in');
		}
	});
}

// Initialize Analytics (only in browser environment)
export const analytics =
	typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

