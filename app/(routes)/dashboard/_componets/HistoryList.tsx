"use client";
import React, { useEffect } from 'react'
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import AddNewSession from './AddNewSession';
import axios from 'axios';
import HistoryTable from './HistoryTable';
import { SessionDetail } from '../medical-agent/[sessionId]/page';
function HistoryList() {
    const [historyList, setHistoryList] = useState<SessionDetail[]>([]);
useEffect(()=>{
  GetHistoryList();
},[]);

    const GetHistoryList= async()=>{
      const result= await axios.get('/api/session-chat?sessionId=all');
      console.log('Session history:', result.data);
      setHistoryList(result.data);
    }
  return (
    <div className='mt-5'>
             <div className='flex items-center flex-col justify-center p-7 border border-dashed rounded-2xl border-2'>
                    <Image
                        src="/medical-assistance.png" // Added file extension (adjust as needed)
                        alt="Empty history placeholder"
                         width={150}
                        height={150}
                    />
                    <h2 className='font-bold text-xl mt-2'>Strart New Consultations</h2>
                    <p>It looks like you have not consulted with any doctors yet.</p>
                    <AddNewSession/>
             </div>  
    </div>
  )
}

export default HistoryList