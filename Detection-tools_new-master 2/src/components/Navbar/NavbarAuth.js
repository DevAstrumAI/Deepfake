/** @format */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const NavbarAuth = () => {
	const { currentUser, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			const result = await logout();
			if (result.success) {
				toast.success('Logged out successfully');
				navigate('/');
			} else {
				toast.error(result.error || 'Failed to log out');
			}
		} catch (error) {
			toast.error('An error occurred during logout');
		}
	};

	return (
		<div className='hidden md:flex items-center space-x-4'>
			{currentUser ? (
				<>
					<div className='flex items-center space-x-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium'>
						<User className='w-4 h-4' />
						<span>
							{currentUser.displayName || currentUser.email?.split('@')[0]}
						</span>
					</div>
					<button
						onClick={handleLogout}
						className='flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium'>
						<LogOut className='w-4 h-4' />
						<span>Logout</span>
					</button>
				</>
			) : (
				<>
					<Link
						to='/login'
						className='flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm font-medium'>
						<LogIn className='w-4 h-4' />
						<span>Login</span>
					</Link>
					<Link
						to='/signup'
						className='flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-lg transition-all duration-200 text-sm font-medium'>
						<span>Sign Up</span>
					</Link>
				</>
			)}
		</div>
	);
};

export default NavbarAuth;
