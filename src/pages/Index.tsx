
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lightbulb, MessageSquare, Star, ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full animate-pulse">
                <Users className="h-12 w-12 text-white" />
              </div>
              <Lightbulb className="h-12 w-12 text-yellow-500 animate-bounce" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Grow & Give
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Exchange skills, grow together. Connect with people in your community to learn something new while sharing what you know best.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg px-8 py-3">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-2">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, safe, and rewarding skill exchanges in three easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">1. Create Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Share your skills and what you'd like to learn. Build trust with photos and descriptions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">2. Connect & Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Browse skills, send requests, and chat with potential skill partners to plan your exchange.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">3. Learn & Teach</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Meet up, exchange knowledge, and rate your experience to help build a trusted community.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Grow & Give?
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-lg text-gray-700">Learn new skills without spending money</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-lg text-gray-700">Meet like-minded people in your community</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-lg text-gray-700">Share your expertise and help others grow</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-lg text-gray-700">Safe and secure platform with verified users</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Start?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Join thousands of skill sharers already learning and teaching in their communities.
                </p>
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                    Join Now - It's Free!
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <span className="text-xl font-bold">Grow & Give</span>
            </div>
            <p className="text-gray-400 mb-6">
              Building stronger communities through skill sharing
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
