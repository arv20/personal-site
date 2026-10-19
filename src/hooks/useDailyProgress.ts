import { useState, useEffect } from 'react';

export interface DailyProgress {
  percent: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  formatted: string;
  countdownFormatted: string;
}

export function useDailyProgress(): DailyProgress {
  const [progress, setProgress] = useState<DailyProgress>(calc());

  useEffect(() => {
    const id = setInterval(() => setProgress(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  return progress;
}

function calc(): DailyProgress {
  // Use EST timezone
  const now = new Date();
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  const startOfDay = new Date(est);
  startOfDay.setHours(0, 0, 0, 0);
  
  const msInDay = 24 * 60 * 60 * 1000;
  const elapsed = est.getTime() - startOfDay.getTime();
  const remaining = Math.max(0, msInDay - elapsed);
  
  const percent = (elapsed / msInDay) * 100;
  const hoursLeft = Math.floor(remaining / (1000 * 60 * 60));
  const minutesLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return {
    percent,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    formatted: `${percent.toFixed(2)}%`,
    countdownFormatted: `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')} left`,
  };
}
