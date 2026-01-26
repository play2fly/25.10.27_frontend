"use client";

import React, { useState, useContext, useRef, useEffect} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BiMenu, BiX } from 'react-icons/bi';
import HeaderTop from "./HeaderTop";
import { useAuth } from "../app/_providers/AuthContext";
// import axios from 'axios';
// import { UserInfo } from '../0x99_utils/Auth';

const Header = ({ onHeightChange }: { onHeightChange?: (height: number) => void }) => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      const height = navRef.current.offsetHeight;
      if (onHeightChange) {
        onHeightChange(height);
      }
    }
  }, []);

  const router = useRouter();
  // const { user, logout } = useContext(UserInfo);
  const user = 's';
  const [isOpen, setIsOpen] = useState(false);
  const { canAccessDashboards } = useAuth();

  const loginHandler = () => {
    // axios
    //     .post("http://localhost:3000/api/auth/logout")
    //     .then(() => {
    //         logout();
    //         router.push("/");
    //     })
    //     .catch((err) => console.log(err));
    router.push('/login');
  };

  const logoutHandler = () => {
    // axios
    //     .post("http://localhost:3000/api/auth/logout")
    //     .then(() => {
    //         logout();
    //         router.push("/");
    //     })
    //     .catch((err) => console.log(err));
    // logout();
    router.push('/');
  };

  const HeaderUnderBarStyle = {
    borderBottom: '1.5px solid black',
  };

  return (
    <header
      ref={navRef}
      className="absolute top-0 left-0 right-0 z-10 text-gray-100"
      style={HeaderUnderBarStyle}
    >
      <HeaderTop />
      <div className="max-w-7xl px-6 mx-auto flex justify-between items-center h-24 md:h-32">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 cursor-pointer select-none"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white font-bold shadow transition-transform group-hover:scale-105">Q</span>
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 transition-colors group-hover:from-indigo-600 group-hover:to-sky-500">QIO LABS</span>
        </Link>
        {/*Desktop navbar*/}
        <nav className="hidden md:flex items-center gap-2">
            <>
              {canAccessDashboards && links.map((item, index) => (
                <Link
                  href={item.url}
                  className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
                  key={index}
                >
                  <span className="font-semibold tracking-wide">
                    {item.title}
                  </span>
                  <span className="pointer-events-none absolute inset-x-3 -bottom-1 h-0.5 rounded bg-gradient-to-r from-indigo-500 to-sky-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </>
        </nav>
        {/*Mobile nav bar*/}
        <div className="md:hidden overflow-hidden">
          <button onClick={() => setIsOpen(true)}>
            <BiMenu size={32} />
          </button>
          <nav
            className={`${
              isOpen ? 'w-1/2 opacity-100' : 'w-0 overflow-hidden opacity-0'
            } duration-300 absolute right-0 top-0 h-screen bg-gray-100 text-gray-900 `}
          >
            <div className="pt-5 px-8">
              <button onClick={() => setIsOpen(false)}>
                <BiX size={32} />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

const links = [
  { title: 'MEXC', url: '/dashboard_01' },
  { title: 'LBANK', url: '/dashboard_02' },
  { title: '07CT', url: '/dashboard_03' },
  { title: '08CT', url: '/dashboard_04' },
];
export default Header;
