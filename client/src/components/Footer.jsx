import React from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Footer = () => {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.2 }}
      className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16 text-sm text-gray-500"
    >
      {/* Top Section */}
      <div className="flex flex-wrap justify-between items-start gap-8 pb-6 border-b border-borderColor">
        {/* Logo & Description */}
        <motion.div variants={childVariants} className="flex flex-col gap-4 max-w-sm">
          <motion.img
            src={assets.logo}
            alt="logo"
            className="h-8 md:h-9"
            variants={childVariants}
          />
          <motion.p variants={childVariants}>
            Premium car rental service with a wide selection of luxury and everyday vehicles for all your driving needs.
          </motion.p>
          <motion.div variants={childVariants} className="flex items-center gap-3 mt-2">
            <a href="#"><img src={assets.facebook_logo} className="w-5 h-5" alt="Facebook" /></a>
            <a href="#"><img src={assets.instagram_logo} className="w-5 h-5" alt="Instagram" /></a>
            <a href="#"><img src={assets.twitter_logo} className="w-5 h-5" alt="Twitter" /></a>
            <a href="#"><img src={assets.gmail_logo} className="w-5 h-5" alt="Email" /></a>
          </motion.div>
        </motion.div>

        {/* Links & Contact */}
        <motion.div
          variants={childVariants}
          className="flex flex-wrap justify-between gap-8 flex-1"
        >
          {/* Quick Links */}
          <div>
            <h2 className="text-base font-medium text-gray-800 uppercase">Quick Links</h2>
            <ul className="mt-3 flex flex-col gap-1.5">
              <li><a href="#">Home</a></li>
              <li><a href="#">Browse Cars</a></li>
              <li><a href="#">List Your Car</a></li>
              <li><a href="#">About Us</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h2 className="text-base font-medium text-gray-800 uppercase">Resources</h2>
            <ul className="mt-3 flex flex-col gap-1.5">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Insurance</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-base font-medium text-gray-800 uppercase">Contact</h2>
            <ul className="mt-3 flex flex-col gap-1.5">
              <li>1234 Luxury Drive</li>
              <li>San Francisco, CA 93101</li>
              <li>+1 234 55666</li>
              <li>info@gmail.com</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        variants={childVariants}
        className="flex flex-col md:flex-row gap-2 items-center justify-between py-5"
      >
        <p>© {new Date().getFullYear()} Brand. All rights reserved</p>
        <ul className="flex items-center gap-4">
          <li><a href="#">Privacy</a></li>
          <li>|</li>
          <li><a href="#">Terms</a></li>
          <li>|</li>
          <li><a href="#">Cookies</a></li>
        </ul>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
