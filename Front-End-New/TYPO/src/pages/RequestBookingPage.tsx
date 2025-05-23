import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const RequestBookingPage: React.FC = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>(null);
    const [date, setDate] = useState("");

    useEffect(() => {
        if (eventId) {
            axios
                .get(`/api/events/${eventId}`)
                .then(res => setEvent(res.data))
                .catch(err => {
                    console.error("❌ Failed to fetch event:", err);
                    alert("Could not load event data.");
                });
        }
    }, [eventId]);

    const handleRequest = async () => {
        if (!eventId || !date || !event) {
            alert("Please select a valid event and date.");
            return;
        }

        const dto = {
            eventId: Number(eventId),
            userId: 1, // Replace with real logged-in user ID
            customerId: 999, // Or from auth/session
            date: new Date(date),
            booked: false,
            status: "PENDING",
            paymentRefNumber: ""
        };

        try {
            await axios.post("/api/bookings", dto);
            alert("✅ Booking request sent!");
            navigate(`/service-provider/${event?.serviceProviderId}`);
        } catch (error: any) {
            console.error("Booking error:", error);
            if (axios.isAxiosError(error) && error.response) {
                alert(`❌ ${error.response.data?.message || "Booking failed."}`);
            } else {
                alert("❌ Unexpected error occurred while booking.");
            }
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-xl font-bold mb-4">Request Booking</h1>
            {event ? (
                <>
                    <p className="mb-2">Booking service: <strong>{event.name}</strong></p>
                    <label className="block mb-1 font-medium">Select Event Date:</label>
                    <input
                        type="date"
                        className="w-full border p-2 rounded mb-4"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                    <button
                        onClick={handleRequest}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Send Booking Request
                    </button>
                </>
            ) : (
                <p>Loading event details...</p>
            )}
        </div>
    );
};

export default RequestBookingPage;
