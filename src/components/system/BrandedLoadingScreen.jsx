import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  "מחשבים לך את הדרך להצלחה...",
  "הבריאות שלך היא ההשקעה הטובה ביותר",
  "כל יום הוא הזדמנות חדשה לשינוי",
  "אנחנו בונים עבורך תוכנית אישית",
  "איכות היא לא מעשה, היא הרגל",
  "הצעד הראשון הוא הכי חשוב",
];

export const BrandedLoadingScreen = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Rotate quotes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col justify-between bg-[#F8F8F8] dark:bg-[#0B0B0C] text-foreground select-none overflow-hidden transition-colors duration-300">
      {/* Top Spacer to mimic status bar height and balance vertical spacing */}
      <div className="h-10" />

      {/* Main Centered Branding Block */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Floating App Video Logo */}
        <motion.div
          animate={{ y: [-7, 7] }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 2.5,
            ease: 'easeInOut',
          }}
          className="w-[180px] h-[180px] rounded-[32px] overflow-hidden shadow-2xl shadow-[#059669]/20"
        >
          <video
            src="/loading_animation.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
        </motion.div>

        {/* Brand Name Title */}
        <h1
          className="mt-5 text-[30px] font-semibold text-[#059669] tracking-[-0.5px] leading-none"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Calori Life
        </h1>

        {/* Indeterminate Indent progress bar */}
        <div className="mt-[22px] w-[180px] h-[3.5px] bg-black/[0.08] dark:bg-white/[0.15] rounded-full overflow-hidden relative">
          <motion.div
            className="h-full w-[35%] bg-gradient-to-r from-transparent via-[#059669] to-transparent rounded-full"
            animate={{ x: ['-100%', '300%'] }}
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: 'linear',
            }}
          />
        </div>
      </div>

      {/* Footer Info Block */}
      <div className="pb-[140px] px-10 flex flex-col items-center text-center">
        {/* Hebrew Health Quotes with Fade Transition */}
        <div className="h-[51px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuoteIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[17px] font-semibold text-black/65 dark:text-white/65 leading-[1.5] max-w-[280px]"
              style={{ fontFamily: "'Heebo', sans-serif" }}
            >
              {QUOTES[currentQuoteIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Version String */}
        <div
          className="mt-[10px] text-[12px] font-semibold text-black/30 dark:text-white/30 tracking-[1.2px] uppercase select-text"
          style={{ fontFamily: "'Heebo', sans-serif" }}
        >
          v6.12.0
        </div>

        {/* Indicator dots */}
        <div className="mt-5 flex justify-center items-center gap-2" dir="ltr">
          {QUOTES.map((_, i) => {
            const isActive = currentQuoteIndex === i;
            return (
              <div
                key={i}
                className={`h-[6px] rounded-full transition-all duration-350 ease-out ${
                  isActive
                    ? 'w-[22px] bg-[#059669]'
                    : 'w-[6px] bg-black/15 dark:bg-white/15'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
