import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  // Ton numéro avec l'indicatif 229
  const phoneNumber = "22968852331"; 
  const message = encodeURIComponent("Bonjour GoGaz ! Je souhaite passer une commande de gaz.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    /* Le conteneur principal fixé en bas à droite */
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
      
      {/* 1. L'effet de halo qui clignote/respire derrière */}
      <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-75 animate-ping"></span>
      
      {/* 2. Le bouton WhatsApp principal, réduit à 50x50 */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="relative flex items-center justify-center w-[50px] h-[50px] bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        aria-label="Commander via WhatsApp"
      >
        <FaWhatsapp className="text-[28px]" />
      </a>
      
    </div>
  );
};

export default WhatsAppButton;
