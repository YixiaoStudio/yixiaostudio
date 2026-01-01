
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PrimaryProduct from './components/PrimaryProduct';
import ProductMatrix from './components/ProductMatrix';
import Philosophy from './components/Philosophy';
import Footer from './components/Footer';
import ReservationModal from './components/ReservationModal';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openReservation = () => setIsModalOpen(true);
  const closeReservation = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen">
      <Navbar onDownloadClick={openReservation} />
      <main>
        <Hero onDownloadClick={openReservation} />
        <PrimaryProduct onDownloadClick={openReservation} />
        <ProductMatrix onDownloadClick={openReservation} />
        <Philosophy />
      </main>
      <Footer />
      
      <ReservationModal isOpen={isModalOpen} onClose={closeReservation} />
    </div>
  );
};

export default App;
