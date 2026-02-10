import React from 'react'
import HistoryList from './_componets/HistoryList'
import { Button } from '@/components/ui/button'
import DoctorsAgentList from './_componets/DoctorsAgentList'
import AddNewSession from './_componets/AddNewSession'
function Dashboard() {
  return (
    <div>
        <div className='flex items-center justify-between py-0'>
            <h2 className='font-bold text-2xl'>My Dashboard</h2>
            <AddNewSession/>
        </div>
        <HistoryList />
        <DoctorsAgentList/>
        {/* Add more components or content for the dashboard here */}
    </div>
  )
}

export default Dashboard