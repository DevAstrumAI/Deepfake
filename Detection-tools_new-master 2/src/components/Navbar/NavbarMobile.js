/** @format */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const NavbarMobile = ({ isOpen, navigation, isActive, onClose }) => {
	const { currentUser, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			const result = await logout();
			if (result.success) {
				toast.success('Logged out successfully');
				navigate('/');
				onClose();
			} else {
				toast.error(result.error || 'Failed to log out');
			}
		} catch (error) {
			toast.error('An error occurred during logout');
		}
	};

	if (!isOpen) return null;
    


    return (
        <motion.div initial={
                {
                    opacity: 0,
                    y: -10
                }
            }
            animate={
                {
                    opacity: 1,
                    y: 0
                }
            }
            exit={
                {
                    opacity: 0,
                    y: -10
                }
            }
            className="md:hidden bg-white border-t border-gray-200">
			<div className='px-2 pt-2 pb-3 space-y-1'>
				{/* Navigation Links */}
				{navigation
					.filter((item) => {
						// Hide upload link if user is not logged in
						if (item.href === '/upload' && !currentUser) {
							return false;
						}
						return true;
					})
					.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.name}
								to={item.href}
								onClick={onClose}
								className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
									isActive(item.href)
										? 'bg-purple-100 text-purple-700'
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
								}`}>
								<Icon className='w-5 h-5' />
								<span>{item.name}</span>
							</Link>
						);
					})}

				{/* Mobile Auth */}
				<div className='px-3 py-2 space-y-2 border-t border-gray-200 mt-2 pt-4'>
					{currentUser ? (
						<>
							<div className='flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium mb-2'>
								<User className='w-4 h-4' />
								<span>
									{currentUser.displayName ||
										currentUser.email?.split('@')[0]}
								</span>
							</div>
							<button
								onClick={handleLogout}
								className='w-full flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium'>
								<LogOut className='w-4 h-4' />
								<span>Logout</span>
							</button>
						</>
					) : (
						<>
							<Link
								to='/login'
								onClick={onClose}
								className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm font-medium'>
								<LogIn className='w-4 h-4' />
								<span>Login</span>
							</Link>
							<Link
								to='/signup'
								onClick={onClose}
								className='flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-lg transition-all duration-200 text-sm font-medium'>
								<span>Sign Up</span>
							</Link>
						</>
					)}
				</div>
            </div>
        </motion.div>
    );
};

export default NavbarMobile;
