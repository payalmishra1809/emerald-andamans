import React from 'react';

interface OctoAvatarProps {
  size?: number;
  mood?: 'happy' | 'thinking' | 'excited' | 'waving' | 'talking';
  className?: string;
  showHiBubble?: boolean;
}

export const OctoAvatar: React.FC<OctoAvatarProps> = ({
  size = 48,
  mood = 'waving',
  className = '',
  showHiBubble = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title="Octo - Your 8-Tentacled Andaman AI Companion"
    >
      {showHiBubble && (
        <span className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md border border-white dark:border-slate-900 animate-bounce">
          Hi! 👋
        </span>
      )}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="octoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#087E8B" />
            <stop offset="50%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#063B5C" />
          </linearGradient>
          <linearGradient id="blushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6F59" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF8A78" stopOpacity="0.4" />
          </linearGradient>
          <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#14B8A6" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Tentacles */}
        {/* Tentacle 1 - Lower Left */}
        <path
          d="M 28 65 Q 12 75 14 88 Q 18 96 26 88 Q 30 80 34 68"
          fill="url(#octoGradient)"
          className="origin-bottom animate-[pulse_3s_ease-in-out_infinite]"
        />
        {/* Tentacle 2 - Mid Left */}
        <path
          d="M 32 68 Q 18 84 24 95 Q 32 98 38 86 Q 40 76 42 68"
          fill="url(#octoGradient)"
        />
        {/* Tentacle 3 - Center Left */}
        <path
          d="M 40 70 Q 32 90 40 98 Q 48 98 46 84 Q 45 76 45 70"
          fill="url(#octoGradient)"
        />
        {/* Tentacle 4 - Center Right */}
        <path
          d="M 55 70 Q 52 84 56 98 Q 66 98 62 86 Q 59 76 56 68"
          fill="url(#octoGradient)"
        />
        {/* Tentacle 5 - Mid Right */}
        <path
          d="M 64 68 Q 74 84 82 92 Q 88 92 84 82 Q 78 74 68 66"
          fill="url(#octoGradient)"
        />
        {/* Tentacle 6 - Far Right */}
        <path
          d="M 70 62 Q 86 68 90 78 Q 92 86 86 86 Q 80 82 68 58"
          fill="url(#octoGradient)"
          className="origin-bottom animate-[pulse_3.5s_ease-in-out_infinite]"
        />

        {/* Tentacle 7 - Left Resting Arm */}
        <path
          d="M 25 54 Q 10 52 8 40 Q 8 32 18 36 Q 23 42 26 50"
          fill="url(#octoGradient)"
        />

        {/* Tentacle 8 - WAVING HAND (Waving Hi Symbol with hand wave animation) */}
        <g
          className="origin-[74px_50px] animate-[wiggle_1.2s_ease-in-out_infinite]"
          style={{ transformOrigin: '74px 50px' }}
        >
          {/* Main waving arm curving up */}
          <path
            d="M 74 50 Q 88 38 86 20 Q 84 10 74 16 Q 76 26 72 44"
            fill="url(#octoGradient)"
            filter="url(#waveGlow)"
          />
          {/* Playful little palm / suction cup tips resembling waving fingers */}
          <circle cx="86" cy="18" r="4.5" fill="#2DD4BF" />
          <circle cx="80" cy="13" r="3.5" fill="#2DD4BF" />
          <circle cx="73" cy="15" r="3.5" fill="#2DD4BF" />
          <circle cx="89" cy="24" r="3" fill="#2DD4BF" />
        </g>

        {/* Head / Body Bulb */}
        <path
          d="M 22 48 C 20 22 34 10 50 10 C 66 10 80 22 78 48 C 77 62 68 70 50 70 C 32 70 23 62 22 48 Z"
          fill="url(#octoGradient)"
        />

        {/* Head Highlight */}
        <ellipse cx="40" cy="22" rx="10" ry="5" transform="rotate(-20 40 22)" fill="white" fillOpacity="0.25" />

        {/* Cheeks / Blush */}
        <circle cx="34" cy="50" r="5" fill="url(#blushGradient)" />
        <circle cx="66" cy="50" r="5" fill="url(#blushGradient)" />

        {/* Eyes */}
        {mood === 'thinking' ? (
          <>
            <circle cx="38" cy="40" r="7" fill="white" />
            <circle cx="39" cy="37" r="4" fill="#063B5C" />
            <circle cx="41" cy="35" r="1.5" fill="white" />
            <path d="M 58 40 Q 64 36 70 40" stroke="#063B5C" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Big friendly cartoon eyes */}
            <circle cx="37" cy="41" r="7.5" fill="white" />
            <circle cx="38" cy="41" r="4.5" fill="#063B5C" />
            <circle cx="36" cy="39" r="2" fill="white" />
            <circle cx="63" cy="41" r="7.5" fill="white" />
            <circle cx="62" cy="41" r="4.5" fill="#063B5C" />
            <circle cx="60" cy="39" r="2" fill="white" />
          </>
        )}

        {/* Mouth */}
        {mood === 'talking' ? (
          <ellipse
            cx="50"
            cy="54"
            rx="4"
            ry="3.5"
            fill="#063B5C"
            className="animate-pulse"
          />
        ) : (
          <path
            d="M 44 51 Q 50 59 56 51"
            stroke="#063B5C"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Tiny Sailor Hat / Snorkel ornament */}
        <path d="M 68 22 Q 74 16 80 18 L 82 24" stroke="#FF6F59" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="80" cy="18" rx="3" ry="2" fill="#FFE57F" />
      </svg>
    </div>
  );
};
