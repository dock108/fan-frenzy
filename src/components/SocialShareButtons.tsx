'use client';

import React from 'react';

// Re-define or import icons if needed
const TwitterIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.775-.023-1.15-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/></svg>;
const FacebookIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.67 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 12 2.04Z"/></svg>;

interface SocialShareButtonsProps {
  score: number;
  maxScore: number;
  title: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ score, maxScore, title }) => {
  const shareText = `I scored ${score}/${maxScore} on today's FanFrenzy Daily Challenge: "${title}"! Can you beat my score? #FanFrenzy #DailyChallenge`;
  // Ensure window is defined before accessing location.origin
  const appUrl = typeof window !== 'undefined' ? window.location.origin + '/daily' : 'https://fanfrenzy.app'; // Use origin or default
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(appUrl);

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;

  return (
    <div className="mt-4">
        <p className="text-sm font-medium text-center text-gray-700 mb-3">Share Your Results:</p>
        <div className="flex justify-center space-x-4">
           <a
             href={twitterShareUrl}
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center justify-center p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
             aria-label="Share on Twitter"
           >
             <TwitterIcon />
           </a>
           <a
             href={facebookShareUrl}
             target="_blank"
             rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
             aria-label="Share on Facebook"
           >
             <FacebookIcon />
           </a>
           {/* Add more share buttons if needed */}
        </div>
    </div>
  );
};

export default SocialShareButtons; 