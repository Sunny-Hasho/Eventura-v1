
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  useEffect(() => {
    document.title = "Eventura - Connect with Event Professionals";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Streamline Your Event Planning
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need to create exceptional events with the right professionals.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-eventura-600 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white h-6 w-6" aria-hidden="true">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Verified Providers</h3>
                    <p className="mt-5 text-base text-gray-500">
                      All service providers undergo verification to ensure reliability and quality. Browse reviews and portfolios to find the perfect match.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-eventura-600 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white h-6 w-6" aria-hidden="true">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Direct Communication</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Communicate directly with providers, discuss details, and negotiate terms through our secure messaging platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-eventura-600 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white h-6 w-6" aria-hidden="true">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Secure Payments</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Process payments safely through our platform with protection for both clients and providers. Release funds only when satisfied.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How Eventura Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              A simple process designed for both clients and service providers.
            </p>
          </div>

          <div className="mt-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
                  For Clients
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-eventura-600 text-white mx-auto">
                  1
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Create Request</h3>
                <p className="mt-2 text-base text-gray-500">
                  Describe your event needs, budget, and preferences in a service request.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-eventura-600 text-white mx-auto">
                  2
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Review Pitches</h3>
                <p className="mt-2 text-base text-gray-500">
                  Receive and evaluate pitches from qualified service providers.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-eventura-600 text-white mx-auto">
                  3
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Hire Provider</h3>
                <p className="mt-2 text-base text-gray-500">
                  Select the best provider and finalize the details of your agreement.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-eventura-600 text-white mx-auto">
                  4
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Complete & Review</h3>
                <p className="mt-2 text-base text-gray-500">
                  After the event, process payment and leave a review for the provider.
                </p>
              </div>
            </div>

            <div className="relative mt-16">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
                  For Providers
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-eventura-600 text-white mx-auto">
                  1
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Create Profile</h3>
                <p className="mt-2 text-base text-gray-500">
                  Build your professional profile with portfolio and verification documents.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-eventura-600 text-white mx-auto">
                  2
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Browse Requests</h3>
                <p className="mt-2 text-base text-gray-500">
                  Find relevant service requests that match your expertise and availability.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-eventura-600 text-white mx-auto">
                  3
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Submit Pitches</h3>
                <p className="mt-2 text-base text-gray-500">
                  Send compelling pitches with your proposed pricing and service details.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-eventura-600 text-white mx-auto">
                  4
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Deliver & Get Paid</h3>
                <p className="mt-2 text-base text-gray-500">
                  Provide your services and receive secure payment through the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Hear from clients and providers who have used Eventura.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-eventura-100 flex items-center justify-center text-eventura-700 mr-3">
                    SJ
                  </div>
                  <div>
                    <CardTitle>Sarah Johnson</CardTitle>
                    <CardDescription>Event Client</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "Eventura made planning my wedding so much easier. I found an amazing photographer and caterer through the platform, and the whole process was seamless. Highly recommend!"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-eventura-100 flex items-center justify-center text-eventura-700 mr-3">
                    MB
                  </div>
                  <div>
                    <CardTitle>Michael Brown</CardTitle>
                    <CardDescription>Photography Provider</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "As a professional photographer, Eventura has been a game-changer for my business. I've connected with clients I wouldn't have found otherwise and increased my bookings by 40%."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-eventura-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-eventura-100">
              Join Eventura today and revolutionize your event planning experience.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="px-8 py-3 text-lg bg-white text-eventura-700 hover:bg-eventura-50">
                <Link to="/register">Create Your Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Company</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Team</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Careers</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Guides</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Terms</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Cookie Policy</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Contact Us</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Twitter</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Facebook</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; 2025 Eventura, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
