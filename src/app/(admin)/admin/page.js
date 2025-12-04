
import AllProducts from '@/features/product/components/AllProducts'
import React from 'react'

function page() {
  return (
    <div className='max-h-[700px] overflow-y-scroll no-scrollbar'>
      <AllProducts/>
    </div>
  )
}

export default page