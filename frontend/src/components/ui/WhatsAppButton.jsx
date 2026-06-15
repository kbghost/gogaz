import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  
  const phoneNumber = "22968852331"; 
  
  // Le message qui sera pré-rempli dans le chat du client
  const message = encodeURIComponent("Bonjour GoGaz ! Je souhaite passer une commande de gaz.");
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      /* Les classes Tailwind : */
      className="
        fixed bottom-8 right-8 z-50 
        flex items-center justify-center 
        w-[60px] h-[60px] 
        bg-[#25D366] text-white 
        rounded-full shadow-lg 
        hover:scale-110 transition-transform duration-300 ease-in-out
        animate-pulse-glow
      "
      aria-label="Commander via WhatsApp"
    >
      <FaWhatsapp className="text-[35px]" />
    </a>
  );
};

export default WhatsAppButton;
