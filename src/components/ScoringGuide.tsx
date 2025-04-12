import React from 'react';
import { InformationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const ScoringGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center">
        <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-500" /> Scoring Guide & Rules
      </h2>
      <div className="space-y-4 text-sm text-gray-600">
        <div className="space-y-2">
          <p className="font-medium text-gray-700">Gameplay:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Drag and drop the events into the correct chronological order.</li>
            <li>You have <strong className="font-semibold">3 guesses</strong> to finalize your order.</li>
            <li>After each guess, feedback will be provided.</li>
            <li>The timer starts when you first move an item.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-gray-700">Guess Feedback:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <strong className="font-semibold">Locked (Green <LockClosedIcon className="h-3 w-3 inline-block text-green-600" />):</strong> 
              Items scoring a perfect 4 points are locked in place and cannot be moved.
            </li>
            <li>
              <strong className="font-semibold">Nearly Correct (Yellow Glow):</strong> 
              Items scoring 2 or 3 points will have a <span className="inline-block px-1 py-0.5 text-xs rounded bg-yellow-100 border border-yellow-400">yellow glow</span>. These are close!
            </li>
            <li>
              <strong className="font-semibold">Incorrect (Blue/Grey):</strong> 
              Items scoring 0 or 1 point remain <span className="inline-block px-1 py-0.5 text-xs rounded bg-blue-50 border border-blue-300">blue/grey</span>. Reorder these.
            </li>
            <li>Feedback clears if you reorder items before the next guess.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-gray-700">Scoring per Item (Max 4 pts):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="font-semibold">+1 pt:</strong> Correct item directly above.</li>
            <li><strong className="font-semibold">+1 pt:</strong> Correct item directly below.</li>
            <li><strong className="font-semibold">+2 pts:</strong> Item is in its exact correct spot.</li>
          </ul>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <p className="font-medium text-gray-700">Final Item Score Colors:</p>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 items-center pl-2 text-xs">
            <div className="flex items-center space-x-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-red-50 border border-red-300"></span><span>0 pts</span></div>
            <div className="flex items-center space-x-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-orange-50 border border-orange-300"></span><span>1 pt</span></div>
            <div className="flex items-center space-x-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-yellow-50 border border-yellow-300"></span><span>2 pts</span></div>
            <div className="flex items-center space-x-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-lime-50 border border-lime-300"></span><span>3 pts</span></div>
            <div className="flex items-center space-x-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-green-100 border border-green-300"></span><span>4 pts</span></div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-gray-700">Final Results:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Displayed after 3 guesses or achieving a perfect score.</li>
            <li>Shows final score per item and total score.</li>
            <li>Hints appear for any remaining incorrect items.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScoringGuide; 