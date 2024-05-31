// import React, { useState } from 'react';
// import axios from 'axios';
// import './App3.css'; // Import CSS file for styling

// const API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
// const HEADERS = {
//     "Authorization": "Bearer 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",
//     "Content-Type": "multipart/form-data",
//     "X-Language": "en" // Specify English as the language
// };

// function App3() {
//     const [transcription, setTranscription] = useState("");
//     const [errorMessage, setErrorMessage] = useState("");
//     const [progress, setProgress] = useState(0);
//     const [loading, setLoading] = useState(false)

//     const handleFileUpload = async (event) => {
//         const file = event.target.files[0];
//         const formData = new FormData();
//         formData.append("file", file);

//         setProgress(0);
//         setTranscription("");
//         setErrorMessage("");
//         setLoading(true)

//         const config = {
//             onUploadProgress: progressEvent => {
//                 const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 50);
//                 setProgress(uploadProgress);
//             }
//         };

//         try {
//             const response = await axios.post(API_URL, formData, {
//                 ...config,
//                 headers: HEADERS
//             });

//             const downloadProgressInterval = setInterval(() => {
//                 setProgress(prevProgress => Math.min(prevProgress + 1, 100));
//             }, 100);

//             setTimeout(() => {
//                 clearInterval(downloadProgressInterval);
//                 setTranscription(response.data.text);
//             }, 2000); // Simulating 2 seconds delay

//         } catch (error) {
//             console.error("Error transcribing audio:", error);
//             setTranscription("");
//             setErrorMessage("Error transcribing audio. Please try again.");
//         } finally {
//             setLoading(false)
//         }
//     };

//     return (
//         <div className="container">
//             <h1>Voice to Text Transcription</h1>
//             <input type="file" accept="audio/*" onChange={handleFileUpload} />
//             {loading && (
//                 <div>
//                     <progress value={progress} max="100" className="progress-bar" />
//                     <div className="progress-text">{progress}%</div>
//                 </div>
//             )}
//             {errorMessage && <p>{errorMessage}</p>}
//             {transcription && (
//                 <div>
//                     <h2>Transcription Result:</h2>
//                     <p>{transcription}</p>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default App3;



import React, { useState } from 'react';
import axios from 'axios';
import './App3.css'; // Import CSS file for styling

const API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
const HEADERS = { "Authorization": "Bearer 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" };

function App3() {
    const [transcription, setTranscription] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });
                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                    console.log(audioBlob)
                    // handleDownload(audioBlob)
                    handleFileUpload(audioBlob);
                });
                mediaRecorder.start();
                setMediaRecorder(mediaRecorder);
            })
            .catch(error => {
                console.error("Error starting recording:", error);
            });
    };

    const handleDownload = (audioBlob) => {
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

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            setMediaRecorder(null);
            setAudioChunks([]);
        }
    };

    const handleFileUpload = async (audioBlob) => {
        const formData = new FormData();
        formData.append("file", audioBlob);
        formData.append("language", "english"); // Add this line to specify English language


        setProgress(0);
        setTranscription("");
        setErrorMessage("");
        setLoading(true);

        const config = {
            onUploadProgress: progressEvent => {
                const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 50);
                setProgress(uploadProgress);
            }
        };

        try {
            const response = await axios.post(API_URL, formData, {
                ...config,
                headers: {
                    ...HEADERS,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const downloadProgressInterval = setInterval(() => {
                setProgress(prevProgress => Math.min(prevProgress + 1, 100));
            }, 100);

            setTimeout(() => {
                clearInterval(downloadProgressInterval);
                setTranscription(response.data.text);
            }, 2000); // Simulating 2 seconds delay

        } catch (error) {
            console.error("Error transcribing audio:", error);
            setTranscription("");
            setErrorMessage("Error transcribing audio. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Voice to Text Transcription</h1>
            <div>
                <button onClick={startRecording} disabled={mediaRecorder !== null}>Start Recording</button>
                <button onClick={stopRecording} disabled={mediaRecorder === null}>Stop Recording</button>
            </div>
            {loading && (
                <div>
                    <progress value={progress} max="100" className="progress-bar" />
                    <div className="progress-text">{progress}%</div>
                </div>
            )}
            {errorMessage && <p>{errorMessage}</p>}
            {transcription && (
                <div>
                    <h2>Transcription Result:</h2>
                    <p>{transcription}</p>
                </div>
            )}
        </div>
    );
}

export default App3;


