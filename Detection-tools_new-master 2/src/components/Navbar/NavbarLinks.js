import React from 'react';
import {Link} from 'react-router-dom';

const NavbarLinks = ({navigation, isActive}) => {
    return (
        <div className="hidden md:flex items-center space-x-8">
            {
            navigation.map((item) => {
                const Icon = item.icon;
                return (
                    <Link key={
                            item.name
                        }
                        to={
                            item.href
                        }
                        className={
                            `flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                isActive(item.href) ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`
                    }>
                        <Icon className="w-4 h-4"/>
                        <span>{
                            item.name
                        }</span>
                    </Link>
                );
            })
        } </div>
    );
};

export default NavbarLinks;
