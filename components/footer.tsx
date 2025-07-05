import Link from 'next/link'
import React from 'react'

const footer = () => {
  return (
    <div className="copyright items-center align-bottom">
        <div className="mt-20">
            <Link href="https://ceala.co.uk/">
          <p className='text-center'>&copy; 2025 Ceala Digital Media</p>
        </Link>
        </div>
    </div>
    
  )
}

export default footer
