import React, { useState } from "react";
import { useCart } from "../../store/cart.jsx";
import { Link, useNavigate } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping, FaCaretDown } from "react-icons/fa6";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import DarkMode from "./DarkMode";
import { userAuth as auth } from "../../shared/userAuth.js";

const MenuLinks = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "Shop", link: "/products" },
  { id: 3, name: "About", link: "/about" },
  { id: 4, name: "Blogs", link: "/blog" },
];

const DropdownLink = [
  { id: 1, name: "Trending Products", link: "/trending" },
  { id: 2, name: "Best Selling", link: "/best-selling" },
  { id: 3, name: "Top Rated", link: "/top-rated" },
];

const Navbar = ({ handleOrderPopup }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const badge = count > 99 ? "99+" : String(count);
  const nav = useNavigate();

  function handleLogout() {
    auth.logout();
    nav("/login", { replace: true });
  }

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
      <div className="py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-primary font-semibold tracking-widest text-2xl uppercase sm:text-3xl"
          >
            Eshop
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <ul className="flex items-center gap-4">
              {MenuLinks.map((data) => (
                <li key={data.id}>
                  <Link
                    to={data.link}
                    className="inline-block px-4 font-semibold text-gray-500 hover:text-black dark:hover:text-white duration-200"
                  >
                    {data.name}
                  </Link>
                </li>
              ))}

              {/* Dropdown */}
              <li className="relative cursor-pointer group">
                <span className="flex items-center gap-[2px] font-semibold text-gray-500 dark:hover:text-white py-2">
                  Quick Links
                  <FaCaretDown className="group-hover:rotate-180 duration-300" />
                </span>
                <div className="absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white shadow-md dark:bg-gray-900 p-2 dark:text-white">
                  <ul className="space-y-2">
                    {DropdownLink.map((data) => (
                      <li key={data.id}>
                        <Link
                          to={data.link}
                          className="text-gray-500 hover:text-black dark:hover:text-white duration-200 inline-block w-full p-2 hover:bg-primary/20 rounded-md font-semibold"
                        >
                          {data.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* Logout button (only if logged in) */}
              {auth.isAuthed() && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="px-4 font-semibold text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </li>
              )}
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
            <button
              className="relative p-3"
              onClick={handleOrderPopup}
              aria-label={`Cart (${count})`}
            >
              <FaCartShopping className="text-xl text-gray-600 dark:text-gray-400" />
              {count > 0 && (
                <div className="min-w-4 h-4 px-1 bg-red-500 text-white rounded-full absolute top-0 right-0 flex items-center justify-center text-[10px]">
                  {badge}
                </div>
              )}
            </button>

            {/* User Account (only for non-admin users) */}
            {auth.user && auth.user.role?.toLowerCase() !== "admin" && (
              <Link
                to="/account"
                className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary"
                title="My Account"
              >
                <FaUserCircle className="text-2xl" />
                <span className="hidden sm:inline font-medium">
                  {auth.user.name || "Account"}
                </span>
              </Link>
            )}
            
            {/* Dark Mode */}
            <DarkMode />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-2xl"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 shadow-md mt-2 p-4 space-y-4">
            {MenuLinks.map((data) => (
              <Link
                key={data.id}
                to={data.link}
                className="block font-semibold text-gray-600 dark:text-gray-300 hover:text-primary"
              >
                {data.name}
              </Link>
            ))}

            {/* Quick Links Dropdown for Mobile */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="font-semibold mb-2">Quick Links</p>
              {DropdownLink.map((data) => (
                <Link
                  key={data.id}
                  to={data.link}
                  className="block font-semibold text-gray-600 dark:text-gray-300 hover:text-primary"
                >
                  {data.name}
                </Link>
              ))}
            </div>

            {/* Logout in mobile menu */}
            {auth.isAuthed() && (
              <button
                onClick={handleLogout}
                className="mt-4 block w-full text-left font-semibold text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
