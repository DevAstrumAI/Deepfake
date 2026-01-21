import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Shield} from 'lucide-react';

const NavbarLogo = () => {
    return (
        <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={
                    {scale: 1.05}
                }
                whileTap={
                    {scale: 0.95}
                }
                className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white"/>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    Deepfake Detector
                </span>
            </motion.div>
        </Link>
    );
};

export default NavbarLogo;
