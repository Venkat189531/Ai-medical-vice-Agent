"use client"
import React from 'react'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react'
import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
export type doctorAgent={
    id:number,
    specialist:string,
    description:string,
    image:string,
    agentPrompt:string,
    voiceId?:string,
    subscriptionRequired:boolean

}

type props={
  doctorAgent:doctorAgent
}
function DoctorAgentCard({doctorAgent}:props) {
  const {has}=useAuth();
  const router=useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  
  const paidUser=has&&has({plan:'pro'})
  const onStartConsultation = async () => {
   

    setLoading(true);

    try {
      const result = await axios.post('/api/session-chat', {
        notes: 'New Consltation',
        selectedDoctor:doctorAgent,
      });
      if (result.data?.sessionId) {
        console.log('Session ID:', result.data.sessionId);
        router.push('/dashboard/medical-agent/'+result.data.sessionId);
      }
    } catch (err) {
      
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='relative'>
    {doctorAgent.subscriptionRequired&&<Badge className='absolute m-2 right-0'>Premium</Badge>}
      <Image src={doctorAgent.image} alt={doctorAgent.specialist} width={200} height={300}
      className='w-full h-[250px] object-cover rounded-xl'
       />
       <h2 className='font-bold mt-1'>{doctorAgent.specialist}</h2>
       <p className='line-clamp-2 text-sm text-gray-500'> {doctorAgent.description}</p>
       <Button className='w-full mt-2' onClick={onStartConsultation} disabled={!paidUser&&doctorAgent.subscriptionRequired}>Start Consultation{loading?<Loader2 className='animate-spin'></Loader2>:<IconArrowRight/>}</Button>
    </div>
  )
}

export default DoctorAgentCard