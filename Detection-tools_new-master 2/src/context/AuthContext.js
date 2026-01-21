/** @format */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const getFirebaseErrorMessage = (error) => {
		const errorCode = error.code;
		const errorMessages = {
			'auth/email-already-in-use':
				'This email is already registered. Please use a different email or try logging in.',
			'auth/invalid-email': 'Please enter a valid email address.',
			'auth/operation-not-allowed':
				'Email/Password authentication is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method.',
			'auth/configuration-not-found':
				'Firebase Authentication is not properly configured. Please check your Firebase project settings and ensure Authentication is enabled.',
			'auth/weak-password':
				'Password is too weak. Please use a stronger password (at least 6 characters).',
			'auth/user-disabled': 'This account has been disabled. Please contact support.',
			'auth/user-not-found': 'No account found with this email address.',
			'auth/wrong-password': 'Incorrect password. Please try again.',
			'auth/too-many-requests':
				'Too many failed attempts. Please try again later.',
			'auth/network-request-failed':
				'Network error. Please check your internet connection and try again.',
			'auth/internal-error':
				'An internal error occurred. Please try again later.',
			'auth/api-key-not-valid':
				'Invalid API key. Please check your Firebase configuration.',
			'auth/project-not-found':
				'Firebase project not found. Please verify your project ID in the configuration.',
		};

		return (
			errorMessages[errorCode] ||
			error.message ||
			'An unexpected error occurred. Please try again.'
		);
	};

	const signup = async (email, password, displayName) => {
		try {
			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return {
					success: false,
					error: 'Please enter a valid email address.',
				};
			}

			// Validate password length
			if (password.length < 6) {
				return {
					success: false,
					error: 'Password must be at least 6 characters long.',
				};
			}

			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			if (displayName && userCredential.user) {
				await updateProfile(userCredential.user, {
					displayName: displayName,
				});
			}
			return { success: true, user: userCredential.user };
		} catch (error) {
			console.error('Signup error:', error);
			return {
				success: false,
				error: getFirebaseErrorMessage(error),
			};
		}
	};

	const login = async (email, password) => {
		try {
			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return {
					success: false,
					error: 'Please enter a valid email address.',
				};
			}

			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			return { success: true, user: userCredential.user };
		} catch (error) {
			console.error('Login error:', error);
			return {
				success: false,
				error: getFirebaseErrorMessage(error),
			};
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
			return { success: true };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const value = {
		currentUser,
		signup,
		login,
		logout,
		loading,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};
