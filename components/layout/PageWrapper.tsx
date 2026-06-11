import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileBottomBar from './MobileBottomBar'

interface PageWrapperProps {
  children: ReactNode
  showFooter?: boolean
  showMobileBar?: boolean
}

export default function PageWrapper({
  children,
  showFooter = true,
  showMobileBar = true,
}: PageWrapperProps) {
  return (
    <div className={showMobileBar ? 'pb-16 md:pb-0' : ''}>
      <Navbar />
      <main>{children}</main>
      {showFooter && <Footer />}
      {showMobileBar && <MobileBottomBar />}
    </div>
  )
}
