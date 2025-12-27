import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Code, Shield, TrendingUp } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Trail<span className="text-purple-400">Room</span>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-white hover:text-purple-300 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Virtual Try-On
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              API-First Platform
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Integrate AI-powered virtual try-on capabilities into your e-commerce platform.
            Transform shopping experiences with just a few lines of code.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight size={20} />
            </Link>
            <a
              href="#demo"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg text-lg font-semibold backdrop-blur-sm transition-colors"
            >
              View Demo
            </a>
          </div>
          <p className="text-gray-400 mt-4">3 free tries per day • No credit card required</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Why Choose TrailRoom?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-purple-400" />}
              title="Lightning Fast"
              description="Generate try-on images in seconds with our optimized AI models"
            />
            <FeatureCard
              icon={<Code className="w-8 h-8 text-purple-400" />}
              title="Developer First"
              description="RESTful API with comprehensive docs and code examples"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-purple-400" />}
              title="Secure & Reliable"
              description="Enterprise-grade security with 99.9% uptime guarantee"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-purple-400" />}
              title="Scalable Pricing"
              description="Pay only for what you use with volume discounts"
            />
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div id="demo" className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">See It In Action</h2>
          <p className="text-gray-300 mb-12">
            Upload a person image and clothing items to generate realistic try-on results
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="grid md:grid-cols-3 gap-6">
              <DemoPlaceholder text="Person Image" />
              <DemoPlaceholder text="Clothing Item" />
              <DemoPlaceholder text="Result" highlight />
            </div>
            <Link
              to="/register"
              className="mt-8 inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Try It Yourself
            </Link>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="py-20 px-6 bg-black/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-gray-300 mb-12">Start free, scale as you grow</p>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              title="Free"
              price="₹0"
              features={[
                '3 tries per day',
                'Basic API access',
                'Community support',
                'Standard quality'
              ]}
            />
            <PricingCard
              title="Starter"
              price="₹2,100"
              features={[
                '2,100 credits',
                'Full API access',
                'Priority support',
                'High quality',
                '10% discount'
              ]}
              highlighted
            />
            <PricingCard
              title="Custom"
              price="Contact Us"
              features={[
                'Unlimited credits',
                'Dedicated support',
                'Custom integration',
                'Volume discounts up to 25%'
              ]}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 TrailRoom. All rights reserved.</p>
          <div className="flex gap-6 justify-center mt-4">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Reference</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const DemoPlaceholder = ({ text, highlight }) => (
  <div
    className={`aspect-square rounded-lg flex items-center justify-center text-gray-400 ${
      highlight
        ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500'
        : 'bg-white/5 border border-white/10'
    }`}
  >
    {text}
  </div>
);

const PricingCard = ({ title, price, features, highlighted }) => (
  <div
    className={`rounded-xl p-8 ${
      highlighted
        ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500 scale-105'
        : 'bg-white/5 border border-white/10'
    }`}
  >
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <div className="text-4xl font-bold text-white mb-6">{price}</div>
    <ul className="space-y-3 text-gray-300">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2">
          <span className="text-purple-400">✓</span>
          {feature}
        </li>
      ))}
    </ul>
    <Link
      to="/register"
      className={`mt-8 block w-full py-3 rounded-lg font-semibold transition-colors ${
        highlighted
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'bg-white/10 hover:bg-white/20 text-white'
      }`}
    >
      Get Started
    </Link>
  </div>
);

export default Landing;
