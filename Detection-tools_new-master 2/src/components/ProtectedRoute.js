/** @format */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
	const { currentUser, loading } = useAuth();

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50'>
				<div className='text-center'>
					<Loader2 className='w-8 h-8 animate-spin text-purple-600 mx-auto mb-4' />
					<p className='text-gray-600'>Loading...</p>
				</div>
			</div>
		);
	}

	if (!currentUser) {
		return <Navigate to='/login' replace />;
	}

	return children;
};

export default ProtectedRoute;
