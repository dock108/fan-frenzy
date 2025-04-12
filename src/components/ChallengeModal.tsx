'use client'

import { useState, Fragment, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  momentIndex: number | null; // Allow null for general challenges
  onSubmitSuccess: () => void; // Callback on successful submission
}

const challengeReasons = [
  'Incorrect Answer/Order',        // General issue
  'Ambiguous Wording/Context',  // Content clarity
  'Incorrect Player/Team Info', // Factual error
  'Technical Bug',               // Site functionality
  'Other'                         // Catch-all
];

export default function ChallengeModal({
  isOpen,
  onClose,
  gameId,
  momentIndex,
  onSubmitSuccess,
}: ChallengeModalProps) {
  const [reason, setReason] = useState<string>(challengeReasons[0]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      gameId,
      momentIndex: momentIndex === -1 ? null : momentIndex, // Send null if general challenge
      reason,
      comment: comment.trim() || undefined,
    };

    try {
      const response = await fetch('/api/submitChallenge/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit challenge');
      }

      // Success
      onSubmitSuccess(); // Trigger success callback (e.g., show confirmation)
      handleClose(); // Close modal

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error("Challenge submission error:", err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setReason(challengeReasons[0]);
    setComment('');
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
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
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {momentIndex === -1 ? 'Challenge This Game' : 'Challenge This Moment'}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                      Reason
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="appearance-none mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    >
                      {challengeReasons.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                      Optional Comment (max 250 chars)
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows={3}
                      maxLength={250}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Provide more details (optional)"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">Error: {error}</p>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 