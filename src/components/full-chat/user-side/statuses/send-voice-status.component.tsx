import { useRef, useState, useEffect } from 'react';

import {
  CaretRightFilled,
  DeleteOutlined,
  PauseOutlined,
  SendOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Flex, Form, message } from 'antd';
import { AudioVisualizer } from 'react-audio-visualize';
import { useTranslation } from 'react-i18next';

import { CloseStatus } from './close-status.component';
import { flattenFloat32Arrays, encodeWAV } from './utils';
import Participants from 'components/forms/statuses/participants.component';
import { useAppSelector } from 'hooks';
import { useUploadFileMutation, useSendVoiceStatusMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

export const SendVoiceStatus = () => {
  const { t } = useTranslation();

  const [blob, setBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wavDataRef = useRef<Float32Array[]>([]);

  const [form] = Form.useForm();
  const participants = Form.useWatch('participants', form);

  const [uploadFile] = useUploadFileMutation();
  const [sendVoiceStatus] = useSendVoiceStatusMutation();
  const instanceCredentials = useAppSelector(selectInstance);

  const openAudioPicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration > 600) {
        message.error(t('VOICE_STATUS_FILE_TOO_LONG'));
        e.target.value = '';
        return;
      }

      setBlob(file);
      setProgress(0);
      e.target.value = '';
    });
  };

  const startRecord = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      message.error(t('MICROPHONE_NOT_SUPPORTED'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 44100 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      audioContextRef.current = audioContext;
      processorRef.current = processor;
      streamRef.current = stream;
      wavDataRef.current = [];

      processor.onaudioprocess = (e) => {
        const channel = e.inputBuffer.getChannelData(0);
        wavDataRef.current.push(new Float32Array(channel));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
    } catch (error) {
      console.error(error);

      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          message.error(t('MICROPHONE_PERMISSION_DENIED'));
          return;
        }

        if (error.name === 'SecurityError') {
          message.error(t('MICROPHONE_BLOCKED_BY_POLICY'));
          return;
        }
      }

      message.error(t('VOICE_STATUS_RECORDING_START_FAILED'));
    }
  };

  const stopRecord = () => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const buffer = flattenFloat32Arrays(wavDataRef.current);
    const wavBlob = encodeWAV(buffer, 44100);

    setBlob(wavBlob);
    setProgress(0);
    setIsRecording(false);
  };

  useEffect(() => {
    if (!blob) {
      audioRef.current = null;
      setProgress(0);
      return;
    }

    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    let rafId: number;

    const updateProgress = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress(audioRef.current.currentTime);
        rafId = requestAnimationFrame(updateProgress);
      }
    };

    const handlePlay = () => {
      rafId = requestAnimationFrame(updateProgress);
      setIsPlaying(true);
    };

    const handlePause = () => {
      cancelAnimationFrame(rafId);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      cancelAnimationFrame(rafId);
      setProgress(0);
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      cancelAnimationFrame(rafId);
      audio.pause();
      URL.revokeObjectURL(audioUrl);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [blob]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSendVoiceStatus = async () => {
    if (!blob) return;

    setIsProcessing(true);

    try {
      const file = new File([blob], `voice-${Date.now()}.wav`, { type: 'audio/wav' });

      const uploadResult = await uploadFile({
        ...instanceCredentials,
        file,
      }).unwrap();

      if (!uploadResult?.urlFile) throw new Error('Upload failed');

      const mappedParticipants = participants?.map((p: string) => {
        const cleaned = p.trim();
        return cleaned.endsWith('@c.us') ? cleaned : `${cleaned}@c.us`;
      });

      await sendVoiceStatus({
        ...instanceCredentials,
        urlFile: uploadResult.urlFile,
        fileName: file.name,
        participants:
          mappedParticipants && mappedParticipants.length > 0 ? mappedParticipants : undefined,
      }).unwrap();

      message.success(t('VOICE_STATUS_SENT_SUCCESS'));
      form.resetFields();
      setBlob(null);
      setProgress(0);
    } catch (e) {
      console.error(e);
      message.error(t('VOICE_STATUS_SENT_ERROR'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAudio = () => {
    setBlob(null);
    setIsPlaying(false);
  };

  return (
    <Flex
      className="send-media"
      vertical
      align="center"
      justify="center"
      style={{
        opacity: isProcessing ? 0.5 : 1,
        pointerEvents: isProcessing ? 'none' : 'auto',
      }}
    >
      <CloseStatus />

      <Flex gap={14} align="center">
        <Flex
          align="center"
          gap={8}
          style={{
            backgroundColor: 'var(--incoming-message-bg)',
            padding: '6px 20px',
            borderRadius: 20,
            width: 300,
            height: 80,
          }}
        >
          <Avatar style={{ width: 40, height: 40 }} />

          {blob && (
            <div onClick={togglePlay} className="delete-voice-status">
              {isPlaying ? <PauseOutlined /> : <CaretRightFilled />}
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: 40, width: 140 }}>
            {blob ? (
              <AudioVisualizer
                ref={visualizerRef}
                blob={blob}
                width={140}
                height={44}
                barWidth={2}
                gap={0.3}
                barColor="#aaa"
                barPlayedColor="#000"
                currentTime={progress}
              />
            ) : (
              <svg width="100%" height="1">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="var(--text-color)"
                  strokeWidth="2"
                  strokeDasharray="4"
                  opacity="0.4"
                />
              </svg>
            )}
          </div>

          {blob && <DeleteOutlined className="delete-voice-status" onClick={handleDeleteAudio} />}
        </Flex>

        <Button
          shape="circle"
          disabled={isPlaying}
          onClick={openAudioPicker}
          style={{ height: 50, width: 50 }}
        >
          📂
        </Button>

        <Button
          shape="circle"
          danger={isRecording}
          disabled={isPlaying}
          onClick={isRecording ? stopRecord : startRecord}
          style={{ height: 50, width: 50 }}
        >
          🎤
        </Button>

        {blob && (
          <Button
            shape="circle"
            type="primary"
            onClick={handleSendVoiceStatus}
            icon={isProcessing ? <LoadingOutlined /> : <SendOutlined />}
            style={{ height: 50, width: 50 }}
          />
        )}

        <input ref={fileInputRef} type="file" accept="audio/*" hidden onChange={handleFileChange} />
      </Flex>

      <Form form={form} style={{ marginTop: 12, width: '100%', maxWidth: 360 }}>
        <Participants />
      </Form>
    </Flex>
  );
};
