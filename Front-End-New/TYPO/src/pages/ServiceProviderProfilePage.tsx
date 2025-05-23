import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

interface ServiceProvider {
    id: number;
    name: string;
    slogan: string;
    photo: string;
}

interface ServiceProviderDetails {
    about: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    accountDetails: string;
    socialMediaLink: string;
    certificates: string;
    experience: string;
}

interface Event {
    id?: number;
    name: string;
    description: string;
    eventType: string;
    price: number;
}

interface Portfolio {
    id: number;
    title: string;
    description: string;
    category: string;
    clientDetails: string;
    photo: string;
}

const ServiceProviderProfilePage: React.FC = () => {
    const { id } = useParams();
    const serviceProviderId = Number(id);
    const navigate = useNavigate();

    const [provider, setProvider] = useState<ServiceProvider | null>(null);
    const [details, setDetails] = useState<ServiceProviderDetails | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);

    const currentUserId = 1; // TODO: Replace with actual logged-in user ID
    const isOwner = currentUserId === serviceProviderId;

    const averageRating = 4.7; // ⭐ mock

    useEffect(() => {
        if (!serviceProviderId) return;

        axios.get(`/api/service-providers/${serviceProviderId}`).then(res => {
            setProvider(res.data);
            setPhotoPreview(res.data.photo);
        });

        axios.get(`/api/service-provider-details/by-provider/${serviceProviderId}`).then(res => {
            setDetails(res.data);
        });

        axios.get(`/api/events/by-provider/${serviceProviderId}`).then(res => {
            setEvents(res.data);
        });

        axios.get(`/api/portfolios/by-provider/${serviceProviderId}`).then(res => {
            setPortfolios(res.data);
        });
    }, [serviceProviderId]);

    const handleBook = (eventId: number) => {
        navigate(`/request-booking/${eventId}`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold">Service Provider Profile</h1>
                {isOwner && (
                    <div className="space-x-2">
                        <button
                            onClick={() => navigate(`/service-provider/${serviceProviderId}/bookings`)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded"
                        >
                            View Bookings
                        </button>
                        <button
                            onClick={() => setEditMode(prev => !prev)}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {editMode ? "Cancel Edit" : "Edit"}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Photo and Name */}
            <div className="flex gap-6 mb-8">
                <img
                    src={photoPreview || ""}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border"
                />
                <div className="flex-1 space-y-1">
                    <h2 className="text-xl font-semibold">{provider?.name}</h2>
                    <p className="text-gray-600">{provider?.slogan}</p>
                    <p className="text-yellow-500 font-medium">⭐ {averageRating} / 5.0</p>
                </div>
            </div>

            {/* Contact Details */}
            {details && (
                <div className="mb-8 space-y-2">
                    <p><strong>About:</strong> {details.about}</p>
                    <p><strong>Description:</strong> {details.description}</p>
                    <p><strong>Phone:</strong> {details.phone}</p>
                    <p><strong>Email:</strong> {details.email}</p>
                    <p><strong>Address:</strong> {details.address}</p>
                    <p><strong>Experience:</strong> {details.experience}</p>
                    <p><strong>Certificates:</strong> {details.certificates}</p>
                    <p><strong>Social Media:</strong> {details.socialMediaLink}</p>
                </div>
            )}

            {/* Events/Services Offered */}
            <h2 className="text-xl font-bold mb-2">Services / Events Offered</h2>
            {events.map(event => (
                <div key={event.id} className="border p-4 rounded mb-4">
                    <h3 className="text-lg font-bold">{event.name}</h3>
                    <p className="text-sm text-gray-600">{event.eventType}</p>
                    <p className="text-green-600 font-medium">₹{event.price}</p>
                    <p className="text-sm">{event.description}</p>
                    {!isOwner && (
                        <button
                            onClick={() => handleBook(event.id!)}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                        >
                            Request Booking
                        </button>
                    )}
                </div>
            ))}

            {/* Portfolio Section */}
            <h2 className="text-xl font-bold mt-8 mb-4">Past Events / Portfolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {portfolios.map(port => (
                    <div key={port.id} className="border rounded overflow-hidden shadow-sm">
                        <img
                            src={port.photo}
                            alt={port.title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                            <h4 className="font-bold text-lg">{port.title}</h4>
                            <p className="text-sm text-gray-600">{port.category}</p>
                            <p className="text-xs text-gray-500">Client: {port.clientDetails}</p>
                            <p className="text-sm mt-2">{port.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceProviderProfilePage;
