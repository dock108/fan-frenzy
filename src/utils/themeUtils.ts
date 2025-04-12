// Theme utility functions for FanFrenzy

// Team color definitions
interface TeamColors {
  primary: string;
  accent: string;
  overlay: string;
}

// Map of team codes to their colors
export const teamColors: Record<string, TeamColors> = {
  // Default - blue/orange
  default: {
    primary: '#3b82f6', // blue-500
    accent: '#f97316',  // orange-500
    overlay: 'rgba(59, 130, 246, 0.1)',
  },
  // Example teams (can be expanded later)
  NE: {
    primary: '#002244',
    accent: '#C60C30',
    overlay: 'rgba(0, 34, 68, 0.1)',
  },
  PHI: {
    primary: '#004C54',
    accent: '#A5ACAF', 
    overlay: 'rgba(0, 76, 84, 0.1)',
  },
  // Add more teams as needed
};

/**
 * Sets team colors as CSS variables on :root
 * @param teamCode The team code to set colors for
 */
export function setTeamColors(teamCode: string): void {
  if (typeof document === 'undefined') return; // Guard for SSR

  const colors = teamColors[teamCode] || teamColors.default;
  const root = document.documentElement;
  
  root.style.setProperty('--team-primary', colors.primary);
  root.style.setProperty('--team-accent', colors.accent);
  root.style.setProperty('--team-overlay', colors.overlay);
}

/**
 * Reset team colors to default
 */
export function resetTeamColors(): void {
  setTeamColors('default');
} 