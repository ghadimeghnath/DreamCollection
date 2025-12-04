import React from 'react'
import Link from 'next/link';

function AdminNavbar() {
  


    return (
        <>
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
                <Link href="/">
                <h1 className='font-semibold md:text-xl'>dream collection</h1>

                </Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <p>Hi! Admin</p>
                    <button className='border rounded-full text-sm px-4 py-1'>Logout</button>
                </div>
            </div>
            
        </>
    );
}

export default AdminNavbar