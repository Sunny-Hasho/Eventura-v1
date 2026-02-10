import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, ShieldCheck, Zap, Heart, Briefcase, UserCheck, Calendar, ArrowRight, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [userType, setUserType] = useState<'client' | 'provider'>('client');

  useEffect(() => {
    document.title = "Eventura - Post Requests, Get Pitches";
  }, []);

  // Mock Data for "Recent Requests" instead of "Popular Services"
  const recentRequests = [
    { title: "Wedding Photographer Needed", location: "Colombo, Sri Lanka", budget: "$500 - $1000", type: "Photography", time: "2 hours ago" },
    { title: "DJ for Corporate Annual Party", location: "Galle Face Hotel", budget: "$300 - $500", type: "Music", time: "5 hours ago" },
    { title: "Catering for 50 Guests", location: "Kandy", budget: "$1500 - $2000", type: "Catering", time: "1 day ago" },
    { title: "Birthday Party Decorator", location: "Negombo", budget: "$200 - $400", type: "Decoration", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      
      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {/* Role Switcher */}
            <div className="inline-flex bg-white p-1 rounded-full shadow-sm border border-gray-200 mb-8 items-center gap-1">
               <button 
                  onClick={() => setUserType('client')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${userType === 'client' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
               >
                  I want to Hire
               </button>
               <button 
                  onClick={() => setUserType('provider')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${userType === 'provider' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
               >
                  I want to Work
               </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {userType === 'client' ? (
                <>
                  <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                    Post your requirements. <br className="hidden md:block"/>
                    <span className="text-slate-900">Get custom pitches.</span>
                  </h1>
                  <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                    Don't waste time searching. Tell us what you need, and top-rated professionals will send you tailored proposals.
                  </p>
                   {/* CTA - Client */}
                  <div className="mt-10 flex justify-center gap-4">
                     <Button size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" asChild>
                        <Link to="/create-request">Post a Request - It's Free</Link>
                     </Button>
                  </div>
                  <p className="mt-4 text-sm text-gray-400 font-medium">
                    No credit card required to post.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                    Find new leads <br className="hidden md:block"/>
                    <span className="text-slate-900">and grow your business.</span>
                  </h1>
                  <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                    Browse hundreds of active service requests from real clients. Pitch your services and get hired directly.
                  </p>
                  <div className="mt-10 flex justify-center gap-4">
                     <Button size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" asChild>
                        <Link to="/join">Join & Browse Requests</Link>
                     </Button>
                     <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg font-medium bg-white hover:bg-gray-50 text-slate-900 border-gray-200" asChild>
                        <Link to="/requests">View Open Jobs</Link>
                     </Button>
                  </div>
                </>
              )}
            </div>
        </div>
      </div>

      {/* TRUSTED BY / STATS */}
      <div className="border-t border-b border-gray-100 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-8 md:gap-16 text-gray-400 grayscale opacity-70 font-semibold items-center text-sm tracking-wider">
             <div className="flex items-center gap-2"><Star className="h-5 w-5" /> TRUSTED BY 1000+ CLIENTS</div>
             <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> VERIFIED PROFESSIONALS</div>
             <div className="flex items-center gap-2"><Zap className="h-5 w-5" /> INSTANT PITCHES</div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">How Eventura Works</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">The easiest way to organize your event.</p>
           </div>
           
           <Tabs defaultValue="client" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-12 h-14 p-1 bg-slate-100 rounded-full">
                <TabsTrigger value="client" className="rounded-full text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">For Clients</TabsTrigger>
                <TabsTrigger value="provider" className="rounded-full text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-full">For Professionals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="client" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="p-8 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
                       <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                          <CheckCircle2 className="w-8 h-8" />
                       </div>
                       <h3 className="text-xl font-semibold mb-3">1. Post a Request</h3>
                       <p className="text-slate-500">Describe your event (wedding, party, corporate), set your budget, and timeline.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
                       <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
                          <Briefcase className="w-8 h-8" />
                       </div>
                       <h3 className="text-xl font-semibold mb-3">2. Receive Pitches</h3>
                       <p className="text-slate-500">Sit back as interested professionals send you custom proposals and quotes.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
                       <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                          <ShieldCheck className="w-8 h-8" />
                       </div>
                       <h3 className="text-xl font-semibold mb-3">3. Hire & Pay</h3>
                       <p className="text-slate-500">Compare profiles, reviews, and prices. Hire the best match securely.</p>
                    </div>
                 </div>
                 <div className="mt-12 text-center">
                    <Button size="lg" className="rounded-full px-8 font-semibold" asChild>
                       <Link to="/create-request">Post a Request Now</Link>
                    </Button>
                 </div>
              </TabsContent>
              
              <TabsContent value="provider" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="p-8 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
                       <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
                          <Search className="w-8 h-8" />
                       </div>
                       <h3 className="text-xl font-semibold mb-3">1. Browse Requests</h3>
                       <p className="text-slate-500">View real-time requests from clients looking for services in your area.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
                       <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                          <Zap className="w-8 h-8" />
                       </div>
                       <h3 className="text-xl font-semibold mb-3">2. Send a Pitch</h3>
                       <p className="text-slate-500">Submit a competitive proposal explaining why you're the best fit.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
                       <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                          <Heart className="w-8 h-8" />
                       </div>
                       <h3 className="text-xl font-semibold mb-3">3. Get Hired</h3>
                       <p className="text-slate-500">Get booked and receive guaranteed payment through our secure platform.</p>
                    </div>
                 </div>
                 <div className="mt-12 text-center">
                    <Button size="lg" className="rounded-full px-8 font-semibold" asChild>
                       <Link to="/join">Join as a Professional</Link>
                    </Button>
                 </div>
              </TabsContent>
           </Tabs>
        </div>
      </div>

       {/* ACTIVE REQUESTS PREVIEW */}
       <div className="py-24 bg-gray-50 border-t border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
               <div>
                  <h2 className="text-3xl font-semibold text-slate-900">Recent Requests</h2>
                  <p className="text-slate-500 mt-2">See what clients are looking for right now.</p>
               </div>
               <Link to="/requests" className="text-primary font-medium hover:underline hidden md:flex items-center gap-2">View all requests <ArrowRight className="w-4 h-4"/></Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentRequests.map((req, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                   <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{req.type}</Badge>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> {req.time}</span>
                   </div>
                   <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{req.title}</h3>
                   <div className="space-y-2 text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400"/> {req.location}</div>
                      <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-gray-400"/> {req.budget}</div>
                   </div>
                   <Button variant="outline" className="w-full rounded-full border-gray-200 group-hover:border-primary group-hover:text-primary" asChild>
                      <Link to="/join">Pitch Now</Link>
                   </Button>
                </div>
              ))}
            </div>
          </div>
       </div>

       {/* VALUE PROPOSITION */}
       <div className="py-24 bg-slate-950 text-white mx-4 lg:mx-8 mb-8 mt-8 rounded-3xl relative overflow-hidden">
          {/* Abstract Background Shapes */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-slate-800 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary rounded-full blur-3xl opacity-20 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-16 items-center">
             <div>
                <h2 className="text-3xl md:text-5xl font-semibold mb-6 leading-tight">
                  The best talent at your <br/> fingertips.
                </h2>
                <div className="space-y-8 text-slate-300 text-lg">
                   <div className="flex gap-4">
                      <div className="mt-1 p-2 bg-slate-800 rounded-lg"><ShieldCheck className="w-6 h-6 text-white" /></div>
                      <div>
                        <h4 className="font-semibold text-white text-xl">Verified Professionals</h4>
                        <p className="text-base mt-2 text-slate-400">Every service provider is vetted to ensure high quality and reliability.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="mt-1 p-2 bg-slate-800 rounded-lg"><Zap className="w-6 h-6 text-white" /></div>
                      <div>
                        <h4 className="font-semibold text-white text-xl">Fast & Secure Booking</h4>
                        <p className="text-base mt-2 text-slate-400">Book services instantly with our secure payment protection.</p>
                      </div>
                   </div>
                </div>
                <div className="mt-10">
                   <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 font-semibold bg-white text-slate-900 hover:bg-gray-100" asChild>
                      <Link to="/join">Find Opportunities</Link>
                   </Button>
                </div>
             </div>
             <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1620984852026-c222956cf9e3?w=800&auto=format&fit=crop&q=60" 
                  alt="Working Professional" 
                  className="rounded-2xl shadow-2xl rotate-2 transform hover:rotate-0 transition-transform duration-500 border-4 border-slate-800/50"
                />
             </div>
          </div>
       </div>
    </div>
  );
};

export default Index;
