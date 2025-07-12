git clone https://github.com/<your-username>/Tinderapp.git
cd Tinderapp


npm install

npm install --save-dev cross-env

npm run dev

If using cross-env, ensure your package.json has:
"scripts": {
  "dev": "cross-env EXPO_NO_TELEMETRY=1 expo start"
}


🛠️ Setup Notes
🔐 Environment Variables

Create a file named .env in the root:

EXPO_PUBLIC_API_URL=https://your-backend-api.com

Also install support for env files:
npm install react-native-dotenv


🔑 Auth & Storage

Authentication is handled using:

    expo-secure-store for storing tokens

    Context API (contexts/AuthContext.tsx) for user state

    Sign in, sign up, sign out, refresh token built-in

    Google OAuth (Web) supported via redirect



🔄 Features

✅ Swipable profile image carousel
✅ Animated Tinder-style layout
✅ Google & Email-based Authentication
✅ Secure Token Storage
✅ Profile editing (bio, photos, interests)
✅ Modular folder structure
✅ Expo Router navigation

📱 Run on Device

    Download Expo Go from Play Store or App Store

    Run npm run dev

    Scan the QR code from your mobile device


📦 Built With

    React Native + Expo

    TypeScript

    expo-router

    Tailwind / NativeWind

    Expo Secure Store

    Context API

    Metro Bundler


---

Let me know if you want to customize this for private repo use, backend API setup, or deployment (e.g., Vercel or Firebase).
