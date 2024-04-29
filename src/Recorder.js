import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaTrashAlt, FaTrash } from "react-icons/fa";

const Recorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const handleStartRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const chunks = [];
        mediaRecorder.addEventListener("dataavailable", (event) => {
          chunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const blob = new Blob(chunks, { type: "audio/wav" });
          setAudioBlob(blob);
        });

        mediaRecorder.start();
        setRecording(true);

        // Start recording timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      // Clear recording timer
      clearInterval(timerRef.current);

      // Get the stream from the mediaRecorder
      const stream = mediaRecorderRef.current.stream;

      // Stop the audio track
      if (stream && stream.getTracks().length > 0) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded_audio_new.wav";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleDeleteRecording = () => {
    if (recording) {
      handleStopRecording();
    }
    setAudioBlob(null);
    setRecordingTime(0);
  };

  // Format timer to display in mm:ss format
  const formatTimer = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div>
      {recording ? (
        <div className="recording-info">
          <div className="recording-controls">
            {/* Dustbin symbol to delete recording */}
            <span className="delete-button" onClick={handleDeleteRecording}>
              <FaTrash />
            </span>

            {/* Display red dot */}
            <div className="red-dot"></div>
            <p className="timer-text">{formatTimer(recordingTime)}</p>
            <p className="recording-text"></p>
            <span onClick={handleStopRecording} className="stop-button">
              <FaStop />
            </span>
          </div>
        </div>
      ) : (
        <button onClick={handleStartRecording}>
          <FaMicrophone />
        </button>
      )}
      {audioBlob && (
        <div>
          <button onClick={handleDownload}>Download Recording</button>
          <button onClick={handleDeleteRecording}>
            <FaTrashAlt /> Delete Recording
          </button>
        </div>
      )}
    </div>
  );
};

export default Recorder;


