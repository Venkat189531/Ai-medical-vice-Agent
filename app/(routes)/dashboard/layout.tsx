import React from 'react'
import AppHeader from './_componets/AppHeader';
function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div >
    <AppHeader/>
    <div className='px-10 md:px-20 lg:px-40 py-10'>{children}</div>
    </div>
  )
}
//className='px-10 md:px-20 lg:px-40 py-10'
export default DashboardLayout