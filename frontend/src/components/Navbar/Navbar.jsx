import React, { useState } from 'react';
import { IoMdSearch } from 'react-icons/io';
import { FaCartShopping, FaCaretDown } from 'react-icons/fa6';
import { FaBars, FaTimes } from 'react-icons/fa'; 
import DarkMode from './DarkMode';

const MenuLinks = [
    { id: 1, name: 'Home', link: '/#' },
    { id: 2, name: 'Shop', link: '/shop' },
    { id: 3, name: 'About', link: '/about' },
    { id: 4, name: 'Blogs', link: '/blog' }
];

const DropdownLink = [
    { id: 1, name: "Trending Products", link: "/#" },
    { id: 2, name: "Best Selling", link: "/#" },
    { id: 3, name: "Top Rated", link: "/#" }
];

const Navbar = ({handleOrderPopup}) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
            <div className="py-4">
                <div className="container mx-auto flex justify-between items-center px-4">
                    
                    {/* Logo */}
                    <a href="#"
                        className="text-primary font-semibold tracking-widest text-2xl uppercase sm:text-3xl">
                        Eshop
                    </a>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <ul className="flex items-center gap-4">
                            {MenuLinks.map((data) => (
                                <li key={data.id}>
                                    <a href={data.link}
                                        className="inline-block px-4 font-semibold text-gray-500 hover:text-black dark:hover:text-white duration-200">
                                        {data.name}
                                    </a>
                                </li>
                            ))}

                            {/* Dropdown */}
                            <li className="relative cursor-pointer group">
                                <a href="#" className="flex items-center gap-[2px] font-semibold text-gray-500 dark:hover:text-white py-2">
                                    Quick Links
                                    <FaCaretDown className="group-hover:rotate-180 duration-300" />
                                </a>
                                <div className="absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white shadow-md dark:bg-gray-900 p-2 dark:text-white">
                                    <ul className="space-y-2">
                                        {DropdownLink.map((data) => (
                                            <li key={data.id}>
                                                <a className="text-gray-500 hover:text-black dark:hover:text-white duration-200 inline-block w-full p-2 hover:bg-primary/20 rounded-md font-semibold"
                                                    href={data.link}>{data.name}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Search (hidden on small) */}
                        <div className="relative group hidden sm:block">
                            <input type="text" placeholder="Search" className="search-bar" />
                            <IoMdSearch className="text-xl text-gray-600 group-hover:text-primary dark:text-gray-400 absolute top-1/2 -translate-y-1/2 right-3 duration-200" />
                        </div>

                        {/* Cart */}
                        <button className="relative p-3" onClick={handleOrderPopup}>
                            <FaCartShopping className="text-xl text-gray-600 dark:text-gray-400" />
                            <div className="w-4 h-4 bg-red-500 text-white rounded-full absolute top-0 right-0 flex items-center justify-center text-xs">
                                4
                            </div>
                        </button>

                        {/* Dark Mode */}
                        <DarkMode />

                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">
                            {menuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 shadow-md mt-2 p-4 space-y-4">
                    {MenuLinks.map((data) => (
                    <a key={data.id} href={data.link} className="block font-semibold text-gray-600 dark:text-gray-300 hover:text-primary">
                        {data.name}
                    </a>
                    ))}

                    {/* Quick Links Dropdown for Mobile */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-semibold mb-2">Quick Links</p>
                    {DropdownLink.map((data) => (
                        <a key={data.id} href={data.link} className="block font-semibold text-gray-600 dark:text-gray-300 hover:text-primary">
                        {data.name}
                        </a>
                    ))}
                    </div>
                </div>
                )}

            </div>
        </div>
    );
};

export default Navbar;
