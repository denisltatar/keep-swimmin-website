import React from 'react';
import './App.css'; // Ensure you have a custom CSS file if needed

// Import images
import Whale from './assets/Keep Swimmin Whale-01 2.png'
import WhiteWhale from './assets/white-whale.png'
import Background from './assets/Group 17@3x.png'
import Prawn from './assets/Prawn@3x.png'
import Screenshot from './assets/Frame 4.png'
import Preview1 from './assets/preview-1.png'
import Preview2 from './assets/preview-2.png'
import Preview3 from './assets/preview-3.png'
import WhalesGroup from './assets/Group 28@3x.png'
import appStoreBadge from './assets/app-store-badge.svg'; 

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center">
      <header className="w-full py-10 bg-blue-500 text-white flex flex-col items-center">
        <img src={WhiteWhale} alt="Keep Swimmin' Logo" className="w-40 mb-7" />
        <h1 className="logo-text text-5xl mb-4">Keep Swimmin'</h1>
        <p className="text-lg mt-1">Stay motivated and Keep Swimmin'!</p>
      </header>

      <main className="w-full flex-grow flex flex-col items-center justify-center text-center px-4">
        <section className="w-full py-10" style={{ backgroundImage: `url(${Background})`, backgroundSize: 'cover' }}>
          <h2 className="text-3xl font-semibold mb-3">About the App</h2>
          <p className="mb-8 max-w-lg mx-auto text-gray-700">
            Keep Swimmin' is a story-oriented motivation app where users start off as a baby whale and grow by digesting krills
            (motivational quotes). Join us on this journey to stay motivated and improve your life!
          </p>
          <img src={Screenshot} alt="App Screenshot" className="w-3/4 max-w-md rounded-lg shadow-lg mx-auto" />
        </section>

        <section className="w-full  bg-white-100">
          <h2 className="text-3xl font-semibold mb-5">Features</h2>
          <div className="flex flex-wrap justify-center">
            <div className="w-64 mx-4 mb-8 flex flex-col items-center">
              <img src={Prawn} alt="Feature 1" className="w-16 mb-3" />
              <h3 className="text-xl font-medium">Daily Quotes</h3>
              <p className="text-center">Receive daily motivational quotes from a range of themes.</p>
            </div>
            <div className="w-64 mx-4 mb-8 flex flex-col items-center">
              <img src={Whale} alt="Feature 3" className="w-24 mb-7" />
              <h3 className="text-xl font-medium">Progress Tracking</h3>
              <p className="text-center">Track your progress as you grow with ease.</p>
            </div>
            <div className="w-64 mx-4 mb-8 flex flex-col items-center">
              <img src={WhalesGroup} alt="Feature 2" className="w-16 mb-3" />
              <h3 className="text-xl font-medium">Community</h3>
              <p className="text-center">Join a community of like-minded individuals.</p>
            </div>
          </div>
          
        </section>

        <p className="mb-1">Join us today...</p>
        <a href="https://apps.apple.com/app/your-app-id" target="_blank" rel="noopener noreferrer">
          <img src={appStoreBadge} alt="Download on the App Store" style={{ width: '150px', height: '50px' }} className="mb-2" />
        </a>

        {/* Privacy Policy Section */}
        <section className="w-full max-w-2xl mx-auto text-left mt-6 bg-gray-50 p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-3xl font-semibold mb-4 text-center">Privacy Policy</h2>
          <p className="text-sm mb-4 text-gray-700">
            At Keep Swimmin', we take your privacy seriously. We collect personal data such as email addresses solely for the
            purpose of providing personalized motivational content. Your data will not be shared with third parties without
            your explicit consent.
          </p>
          <p className="text-sm mb-4 text-gray-700">
            We also collect anonymous usage data to improve the app experience. You can opt-out of data collection at any time
            through the app settings. By using Keep Swimmin', you agree to our terms and conditions outlined in this privacy
            policy.
          </p>
          <p className="text-sm text-gray-700">
            For any concerns or questions regarding your data, please contact us at support@keepswimmin.com.
          </p>
        </section>
      </main>

      <footer className="w-full py-6 bg-blue-500 text-white text-center">
        <p>&copy; 2024 Keep Swimmin'. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
