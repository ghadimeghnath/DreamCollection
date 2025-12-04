import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer";

export default function UserLayout({ children }) {
  return (
    <>
       <header className='text-center'>
          <Navbar />
        </header>
        {children}
      <Footer />
    </>
  );
}
