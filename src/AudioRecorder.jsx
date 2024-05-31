import React, { Component } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';

const API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
const HEADERS = { "Authorization": "Bearer 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" };

class AudioRecorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
      blobURL: '',
      isBlocked: false,
      transcription: '',
      progress: 0,
      loading: false,
      errorMessage: '',
    };
    this.Mp3Recorder = new MicRecorder({ bitRate: 128 });
  }

  componentDidMount() {
    navigator.getUserMedia({ audio: true },
      () => {
        console.log('Permission Granted');
        this.setState({ isBlocked: false });
      },
      () => {
        console.log('Permission Denied');
        this.setState({ isBlocked: true });
      },
    );
  }

  start = () => {
    if (this.state.isBlocked) {
      console.log('Permission Denied');
    } else {
      this.Mp3Recorder
        .start()
        .then(() => {
          this.setState({ isRecording: true });
        })
        .catch((e) => console.error(e));
    }
  };

  stop = () => {
    this.Mp3Recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const blobURL = URL.createObjectURL(blob);
        this.setState({ blobURL, isRecording: false });
      })
      .catch((e) => console.log(e));
  };

  download = () => {
    const { blobURL } = this.state;
    const link = document.createElement('a');
    link.href = blobURL;
    link.download = 'recorded_audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  send = async () => {
    const formData = new FormData();
    formData.append('audio', this.state.blobURL);

    this.setState({ progress: 0, transcription: '', errorMessage: '', loading: true });

    const config = {
      onUploadProgress: progressEvent => {
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        this.setState({ progress: uploadProgress });
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

      this.setState({ transcription: response.data });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      this.setState({ transcription: '', errorMessage: 'Error transcribing audio. Please try again.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <div>
        <button onClick={this.start} disabled={this.state.isRecording}>
          Record
        </button>
        <button onClick={this.stop} disabled={!this.state.isRecording}>
          Stop
        </button>
        <button onClick={this.download} disabled={!this.state.blobURL}>
          Download
        </button>
        <button onClick={this.send} disabled={!this.state.blobURL || this.state.loading}>
          Send
        </button>
        <audio src={this.state.blobURL} controls="controls" />
        <div>
          Progress: {this.state.progress}%
        </div>
        <div>
          Transcription: {this.state.transcription}
        </div>
        {this.state.errorMessage && (
          <div>
            Error: {this.state.errorMessage}
          </div>
        )}
      </div>
    );
  }
}

export default AudioRecorder;
