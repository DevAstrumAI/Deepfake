import React from 'react';

const NavbarAuth = () => {
    return (
        <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>AI Ready</span>
            </div>
        </div>
    );
};


export default NavbarAuth;
