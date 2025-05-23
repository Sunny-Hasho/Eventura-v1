import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const eventId = location.state?.eventId || 1;
    const userId = location.state?.userId || 1;

    const [paymentRef, setPaymentRef] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post("/api/bookings", {
                date: new Date().toISOString(),
                paymentRefNumber: paymentRef,
                booked: true,
                event: { id: eventId },
                user: { id: userId },
                customerId: 999,
            });

            alert("Booking successful!");
            navigate("/"); // Redirect to home or success page
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Booking</h1>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="paymentRef">
                        Payment Reference Number
                    </label>
                    <input
                        id="paymentRef"
                        name="paymentRef"
                        type="text"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
                >
                    Submit Payment
                </button>
            </form>
        </div>
    );
};

export default PaymentPage;
