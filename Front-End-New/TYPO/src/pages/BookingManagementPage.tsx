import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BookingManagementPage: React.FC = () => {
    const { id: serviceProviderId } = useParams();
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        if (serviceProviderId) {
            axios.get(`/api/bookings/by-provider/${serviceProviderId}`)
                .then(res => setBookings(res.data))
                .catch(err => console.error("Failed to load bookings", err));
        }
    }, [serviceProviderId]);

    const handleAction = async (bookingId: number, status: string) => {
        try {
            await axios.put(`/api/bookings/${bookingId}/status`, null, {
                params: { status }
            });
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status } : b)
            );
        } catch (err) {
            console.error("Failed to update booking", err);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Manage Booking Requests</h2>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                bookings.map(booking => (
                    <div key={booking.id} className="border p-4 rounded mb-4 shadow">
                        <p><strong>Event:</strong> {booking.eventName}</p>
                        <p><strong>Customer Email:</strong> {booking.userEmail}</p>
                        <p><strong>Date:</strong> {new Date(booking.date).toDateString()}</p>
                        <p><strong>Status:</strong> {booking.status}</p>
                        {booking.status === "PENDING" && (
                            <div className="mt-2 space-x-2">
                                <button
                                    onClick={() => handleAction(booking.id, "APPROVED")}
                                    className="bg-green-600 text-white px-3 py-1 rounded"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleAction(booking.id, "REJECTED")}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default BookingManagementPage;
