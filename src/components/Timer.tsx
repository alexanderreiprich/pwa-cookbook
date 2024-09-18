import { Button } from '@mui/material';
import { blue } from '@mui/material/colors';
import { useState, useRef, useEffect } from 'react';

// Timer component
export default function Timer({ defaultTime }: { defaultTime: number }) {
  const [time, setTime] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      timerRef.current = window.setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    }

    if (time === 0 && isRunning) {
      // Play alarm sound
      if (audioRef.current) {
        audioRef.current.play();
      }
      // Show alert and stop timer
      alert('Zeit ist abgelaufen!');
      stopTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, time]);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset the audio to the start
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTime(defaultTime);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset the audio to the start
    }
  };

  const setTimer = () => {
    const userInput = prompt('Zeit in Minuten angeben:');
    if (userInput) {
      const userTime = parseInt(userInput, 10);
      if (!isNaN(userTime)) {
        setTime(userTime * 60);
      } else {
        alert('Ungültige Eingabe. Bitte geben Sie eine Zahl ein.');
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
        bottom: 2,
        width: "auto",
        backgroundColor: blue[200],
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '5px',
        fontSize: 'xx-large'
      }}>
        <div style={{ fontSize: '2rem', padding: "0px 5px 0px 5px", marginBottom: "5px",  color: "#1976d2", backgroundColor: '#ffffff', borderRadius: 7 }}>
            <span>{formatTime(time)}</span>
        </div>
        <span style={{ display: 'flex', gap: '1rem', paddingBottom: 5 }}>
          <Button onClick={startTimer} disabled={isRunning}>Start</Button>
          <Button onClick={stopTimer} disabled={!isRunning}>Stop</Button>
          <Button onClick={setTimer}>Timer stellen</Button>
          <Button onClick={resetTimer}>Reset</Button>
        </span>
        <audio ref={audioRef} src="/timeralarm.mp3" />
      </div>
  );
};
