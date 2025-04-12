'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white dark:bg-gray-800 pb-12 shadow-xl">
              {/* Close Button & Header */}
              <div className="flex items-center justify-between px-4 pt-5 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                   <Image 
                     src="/images/icon.png"
                     alt="FanFrenzy Icon" 
                     width={28}
                     height={28}
                   />
                   <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Menu
                   </Dialog.Title>
                </div>
                <button
                  type="button"
                  className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 dark:text-gray-300"
                  onClick={onClose}
                  aria-label="Close menu"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Links */}
              <div className="mt-6 space-y-2 px-4">
                <Link href="/daily" className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>Daily Challenge</Link>
                <Link href="/rewind" className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>Team Rewind</Link>
                <Link href="/shuffle" className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>Shuffle Mode</Link>
                <Link href="/leaderboard" className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>Leaderboard</Link>
              </div>

              {/* Auth Links / Theme Toggle */}
              <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-6 pb-4 px-4 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Theme</span>
                    <ThemeToggle />
                 </div>
                 {user ? (
                   <button onClick={() => { signOut(); onClose(); }} className="w-full text-left block rounded-md py-2 px-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                     Sign Out
                   </button>
                 ) : (
                   <Link href="/login" className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>
                     Sign In / Sign Up
                   </Link>
                 )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default MobileMenu; 