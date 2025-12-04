import React from 'react'
import AdminNavbar from './components/AdminNavbar'
import AdminSidebar from './components/AdminSidebar'
import AllProducts from '../product/components/AllProducts'

function Admin() {
  return (<>
    <AdminNavbar/>
    <div className="flex max-h-screen ">
    <AdminSidebar/>
    <div className="p-3">
    <AllProducts/>
    </div>
    </div>
  </>
  )
}

export default Admin