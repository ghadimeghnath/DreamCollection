
import AllProducts from '@/features/product/components/AllProducts'
import React from 'react'

function page() {
  return (
    <div className='min-h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] overflow-y-scroll no-scrollbar'>
      <AllProducts/>
    </div>
  )
}

export default page