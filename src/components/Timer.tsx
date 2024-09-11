import { Button } from '@mui/material';
import blue from '@mui/material/colors/blue';
import React, { useState, useRef, useEffect } from 'react';

// Timer component
export default function Timer( {defaultTime}: {defaultTime: number}) {
  const [time, setTime] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = window.setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTime(defaultTime);
  };

  const setTimer = () => {
    const userInput = prompt('Zeit in Minuten angeben:');
    if (userInput) {
      const userTime = parseInt(userInput, 10);
      if (!isNaN(userTime)) {
        setTime(userTime*60);
      } else {
        alert('Invalid input. Please enter a number.');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div style={{
        position: "sticky",
        bottom: 0,
        width: "auto",
        backgroundColor: blue[200],
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '2rem' , paddingBottom: 10 }}>
            <span style={{ paddingRight: 20 }}>Timer</span>
            <span>{formatTime(time)}</span>
        </div>
        <span style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={startTimer} disabled={isRunning}>Start</Button>
          <Button onClick={stopTimer} disabled={!isRunning}>Stop</Button>
          <Button onClick={setTimer}>Timer stellen</Button>
          <Button onClick={resetTimer}>Reset</Button>
        </span>
      </div>
  );
};
