"use client";
import Vapi from '@vapi-ai/web';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { doctorAgent } from '../../_componets/DoctorAgentCard';
import { Circle, PhoneCall, PhoneOff, Loader } from "lucide-react";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: any;
  selectedDoctor: doctorAgent;
  createdOn: string;
};

type Message = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const router=useRouter();
  // Fetch session details
  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionDetails = async () => {
      try {
        const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
        console.log(result.data);
        setSessionDetail(result.data);
      } catch (err) {
        console.error("Failed to fetch session details", err);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  // Start call
  const StartCall = async () => {
    if (!sessionDetail) {
      console.warn("Cannot start call until sessionDetail is loaded");
      return;
    }

    // Stop previous instance if any
    if (vapiInstance) {
      try {
        await vapiInstance.stop?.();
      } catch (err) {
        console.warn('No active call to stop or cleanup issue:', err);
      }
    }

    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapiInstance(vapi);

    // Error handler
    vapi.on('error', (err) => {
      // console.error('Vapi error:', err);
      if (err?.error?.msg === 'Meeting has ended') {
        console.warn('Meeting has ended. Call will need to restart.');
        setCallStarted(false);
      }
    });

    const VapiAgentConfig = {
      name: 'AI Medical Doctor Voice Agent',
      firstMessage:
        'Hi there! I am your AI Medical Assistant. I am here to help you with any health questions or concerns you might have today. How are you feeling?',
      transcriber: {
        provider: 'assembly-ai',
        language: 'en',
      },
      voice: {
        provider: 'playht',
        voiceId: sessionDetail?.selectedDoctor?.voiceId || '',
      },
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              sessionDetail?.selectedDoctor?.agentPrompt ||
              'You are a helpful medical assistant.',
          },
        ],
      },
    };

    try {
      await vapi.start(VapiAgentConfig);
      console.log('Vapi started successfully');
    } catch (err) {
      console.error('Failed to start Vapi:', err);
      return;
    }

    // Attach call events
    vapi.on('call-start', () => {
      console.log('Call started');
      setCallStarted(true);
    });

    vapi.on('call-end', () => {
      console.log('Call ended');
      setCallStarted(false);
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const { role, transcriptType, transcript } = message;
        console.log(`${role}: ${transcript}`);

        if (transcriptType === 'partial') {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType === 'final') {
          setMessages((prev) => [...prev, { role, text: transcript }]);
          setLiveTranscript('');
          setCurrentRole(null);
        }
      }
    });

    vapi.on('speech-start', () => {
      console.log('Assistant started speaking');
      setCurrentRole('assistant');
    });

    vapi.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setCurrentRole('user');
    });
  };

  // End call
  const endCall = async () => {
    setLoading(true);
    if(!vapiInstance) return;
    vapiInstance.stop();
    console.log("helllo");
    vapiInstance.off('call-start');
    console.log("helllo1");
    vapiInstance.off('call-end');
    vapiInstance.off('messages');
    vapiInstance.off('speech-start');
    vapiInstance.off('speech-end');
    setCallStarted(false);
    setVapiInstance(null);
    const result=await GenerateReport();
    setLoading(false);
    toast.success('Your report is generated!');
    router.replace('/dashboard');

  };

  // Generate report
  const GenerateReport = async () => {
    console.log("Fetching medical report...");
    const result = await axios.post('/api/medical-report', {
      messages:messages,
      sessionDetail:sessionDetail,
      sessionId:sessionId
    });
    console.log("Medical report generated:", result.data);
    return result.data;
  };

  return (
    <div className='p-5 border rounded-3xl bg-secondary'>
      <div className='flex justify-between items-center'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'>
          <Circle className={`h-4 w-4 rounded-full ${callStarted ? 'bg-green-500' : 'bg-red-500'}`} />
          {callStarted ? 'Connected...' : 'Not Connected'}
        </h2>
        <h2 className='font-bold text-xl text-gray-400'>00:00</h2>
      </div>

      {sessionDetail && (
        <div className='flex items-center flex-col mt-10'>
          <Image
            src={sessionDetail?.selectedDoctor?.image}
            alt={sessionDetail?.selectedDoctor?.specialist}
            width={120}
            height={120}
            className="w-[100px] h-[100px] object-cover rounded-full"
          />
          <h2 className='mt-2 text-lg'>{sessionDetail?.selectedDoctor?.specialist}</h2>
          <p className='text-sm text-gray-400'>AI Medical Voice Agent</p>

          <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72'>
            {messages.slice(-4).map((msg, index) => (
              <h2 className='text-gray-400 p-2' key={index}>
                {msg.role}: {msg.text}
              </h2>
            ))}

            {liveTranscript && liveTranscript.length > 0 && (
              <h2 className='text-lg'>{currentRole}: {liveTranscript}</h2>
            )}
          </div>

          {!callStarted ? (
            <Button className="mt-20" onClick={StartCall} disabled={loading || !sessionDetail}>
              {loading ? <Loader className='animate-spin' /> : <PhoneCall />} Start Call
            </Button>
          ) : (
            <Button variant={"destructive"} onClick={endCall}>
              {loading ? <Loader className='animate-spin' /> : <PhoneOff />} Disconnect
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;