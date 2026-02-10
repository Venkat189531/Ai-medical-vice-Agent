import React from 'react'
import Image from 'next/image'
import { doctorAgent } from './DoctorAgentCard'

type Props = {
  doctorAgent: doctorAgent
  setSelectedDoctor: (doctor: doctorAgent) => void
  selectedDoctor: doctorAgent
}

function SuggestedDoctorCard({ doctorAgent: agent, setSelectedDoctor, selectedDoctor }: Props) {
  return (
    <div
      className={`flex flex-col items-center border rounded-2xl shadow p-5 hover:border-blue-500 cursor-pointer
        ${selectedDoctor?.id === agent?.id ? 'border-blue-500' : ''}`}
      onClick={() => setSelectedDoctor(agent)}
    >
      <Image
        src={agent?.image}
        alt={agent?.specialist}
        width={70}
        height={70}
        className="w-[50px] h-[50px] object-cover rounded-full"
      />
      <h2 className="font-bold text-sm text-center">{agent?.specialist}</h2>
      <p className="line-clamp-2 text-sm text-gray-500 text-center">
        {agent?.description}
      </p>
    </div>
  )
}

export default SuggestedDoctorCard
