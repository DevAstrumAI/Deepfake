/** @format */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
	Shield,
	Upload,
	BookOpen,
	Info,
	Menu,
	X,
	DollarSign,
} from 'lucide-react';
import NavbarLogo from './NavbarLogo';
import NavbarLinks from './NavbarLinks';
import NavbarAuth from './NavbarAuth';
import NavbarMobile from './NavbarMobile';

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const location = useLocation();

	const navigation = [
		{ name: 'Home', href: '/', icon: Shield },
		{ name: 'Upload', href: '/upload', icon: Upload },
		{ name: 'Learn', href: '/educational', icon: BookOpen },
		{ name: 'Pricing', href: '/pricing', icon: DollarSign },
		{ name: 'About', href: '/about', icon: Info },
	];

	const isActive = (path) => location.pathname === path;

	const { currentUser } = useAuth();

	const filteredNavigation = navigation.filter((item) => {
		// Hide upload link if user is not logged in
		if (item.href === '/upload' && !currentUser) {
			return false;
		}
		if (item.href === '/upload' && location.pathname === '/upload') {
			return false;
		}
		return true;
	});

	return (
		<nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm'>
			<div className='px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					<NavbarLogo />
					<NavbarLinks navigation={filteredNavigation} isActive={isActive} />
					<NavbarAuth />
					<div className='md:hidden'>
						<button
							onClick={() => setIsOpen(!isOpen)}
							className='inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500'>
							{isOpen ? (
								<X className='w-6 h-6' />
							) : (
								<Menu className='w-6 h-6' />
							)}
						</button>
					</div>
				</div>
			</div>
			<NavbarMobile
				isOpen={isOpen}
				navigation={filteredNavigation}
				isActive={isActive}
				onClose={() => setIsOpen(false)}
			/>
		</nav>
	);
};

export default Navbar;
