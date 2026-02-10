import React from 'react';
import Image from 'next/image'; // Import Image from next/image if using Next.js
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
const menuOptions = [
  {id:1, label: 'Home', path: '/dashboard' },
  {id:2, label: 'History', path: '/dashboard/history' },
  {id:3, label: 'Pricing', path: '/dashboard/pricing' },
  {id:4, label: 'Profile', path: '/profile' },
];
function AppHeader() {
  return (
    <div className='flex items-center justify-between p-4 bg-white shadow-md dark:bg-gray-800'>
      <Image 
        src="/logo.svg" // Simplified path (public folder is automatically served)
        alt="logo"
        width={50}
        height={30} // Fixed typo: 'heigth' to 'height'
      />
      <div className='hidden md:flex items-center gap-12'>
      {
        menuOptions.map((option,index) => (
         <Link key={index} href={option.path}>
            <h2 className='hover:font-bold cursor-pointer transition-all'>{option.label}</h2>
         </Link>
    ))}
    </div>
    <UserButton/>
    </div>
  );
}

export default AppHeader;