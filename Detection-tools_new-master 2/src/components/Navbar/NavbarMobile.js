import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';

const NavbarMobile = ({
    isOpen,
    navigation,
    isActive,
    onClose
}) => {
    if (!isOpen) 
        return null;
    


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
            <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Navigation Links */}
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
                            onClick={onClose}
                            className={
                                `flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                                    isActive(item.href) ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`
                        }>
                            <Icon className="w-5 h-5"/>
                            <span>{
                                item.name
                            }</span>
                        </Link>
                    );
                })
            }

                {/* Mobile Status */}
                <div className="px-3 py-2">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>AI Ready</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NavbarMobile;
