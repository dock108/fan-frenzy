'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SocialShareButtons from './SocialShareButtons'; // Import the new component

// Simple Social Icons (Example - consider using react-icons or svgs)
// const _TwitterIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.775-.023-1.15-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/></svg>;
// const _FacebookIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.67 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 12 2.04Z"/></svg>;

// Function to format time (MM:SS) - Can be moved to a utils file
const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  maxScore: number;
  title: string; // Challenge title
  isPerfect?: boolean;
  elapsedTime?: number; // Time in seconds, only if perfect first guess
  guessesTaken?: number; // Number of guesses if perfect (but not first guess)
  onOpenChallengeModal: () => void; // Add handler to open challenge modal
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  score,
  maxScore,
  title,
  isPerfect,
  elapsedTime,
  guessesTaken,
  onOpenChallengeModal
}) => {

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        {/* Overlay - Updated Style */}
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          as="div"
        >
          {/* Updated Overlay for foggy effect */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className={`text-xl font-semibold leading-6 text-center ${isPerfect ? 'text-green-600' : 'text-orange-600'}`}
                >
                  {isPerfect ? 'Perfect Order!' : 'Order Submitted!'}
                </Dialog.Title>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Challenge: {title}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    Score: {score} / {maxScore}
                  </p>
                  {/* Display Time or Guesses if Perfect */}
                  {isPerfect && elapsedTime && (
                    <p className="text-sm text-gray-600 mt-1">(Completed in {formatTime(elapsedTime)} on first guess)</p>
                  )}
                  {isPerfect && guessesTaken && guessesTaken > 1 && (
                    <p className="text-sm text-gray-600 mt-1">(Completed in {guessesTaken} guesses)</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <SocialShareButtons score={score} maxScore={maxScore} title={title} />
                </div>

                {/* Close Button & Challenge Button Wrapper - Stacked Vertically */}
                <div className="mt-6 text-center flex flex-col items-center space-y-3">
                  {/* Dismiss Button (Keep styling) */}
                  <button
                    type="button"
                    className="w-full max-w-xs inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Dismiss
                  </button>
                  {/* Challenge Button - Red Styling */}
                  <button
                    type="button"
                    className="w-full max-w-xs inline-flex justify-center rounded-md border border-red-300 bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      onClose(); // Close results modal first
                      onOpenChallengeModal(); // Then open challenge modal
                    }}
                  >
                    Challenge this Game?
                  </button>
                </div>

                 {/* Optional: Close icon button at top right */}
                 <button
                    type="button"
                    className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                    onClick={onClose}
                    aria-label="Close modal"
                 >
                    <XMarkIcon className="h-5 w-5" />
                 </button>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ResultsModal; 