import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ServiceProviderDetailsPage from "./pages/ServiceProviderDetailsPage";
import ServiceProviderProfilePage from "./pages/ServiceProviderProfilePage";
import BookingManagementPage from "./pages/BookingManagementPage";
import RequestBookingPage from "./pages/RequestBookingPage";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Registration */}
                <Route path="/register-service-provider" element={<ServiceProviderDetailsPage />} />

                {/* Public or Owner View of a Profile */}
                <Route path="/service-provider/:id" element={<ServiceProviderProfilePage />} />

                {/* Event Seeker: Request a Booking */}
                <Route path="/request-booking/:eventId" element={<RequestBookingPage />} />

                {/* Service Provider: View and Manage Bookings */}
                <Route path="/service-provider/:id/bookings" element={<BookingManagementPage />} />

                {/* Optional fallback route */}
                {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
        </Router>
    );
};

export default App;
