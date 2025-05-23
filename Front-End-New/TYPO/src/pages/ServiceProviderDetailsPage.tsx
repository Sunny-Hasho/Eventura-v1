import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface EventInput {
    name: string;
    description: string;
    eventType: string;
    price: number;
}

interface PortfolioInput {
    title: string;
    description: string;
    category: string;
    clientDetails: string;
    photo: string;
}

const ServiceProviderDetailsPage: React.FC = () => {
    const navigate = useNavigate();

    const [providerInfo, setProviderInfo] = useState({
        name: "",
        slogan: "",
        photo: "",
    });

    const [details, setDetails] = useState({
        serviceProviderName: "",
        about: "",
        description: "",
        phone: "",
        email: "",
        address: "",
        accountDetails: "",
        socialMediaLink: "",
        certificates: "",
        experience: "",
    });

    const [events, setEvents] = useState<EventInput[]>([
        { name: "", description: "", eventType: "", price: 0 },
    ]);

    const [portfolios, setPortfolios] = useState<PortfolioInput[]>([
        { title: "", description: "", category: "", clientDetails: "", photo: "" },
    ]);

    const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProviderInfo({ ...providerInfo, [name]: value });
    };

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDetails({ ...details, [name]: value });
    };

    const handleEventChange = (index: number, field: keyof EventInput, value: string | number) => {
        const updated = [...events];
        (updated[index][field] as string | number) = value;
        setEvents(updated);
    };

    const handlePortfolioChange = (index: number, field: keyof PortfolioInput, value: string) => {
        const updated = [...portfolios];
        updated[index][field] = value;
        setPortfolios(updated);
    };

    const handlePortfolioImageUpload = (index: number, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const updated = [...portfolios];
            updated[index].photo = reader.result as string;
            setPortfolios(updated);
        };
        reader.readAsDataURL(file);
    };

    const addEvent = () => {
        setEvents([...events, { name: "", description: "", eventType: "", price: 0 }]);
    };

    const removeEvent = (index: number) => {
        const updated = [...events];
        updated.splice(index, 1);
        setEvents(updated);
    };

    const addPortfolio = () => {
        setPortfolios([...portfolios, { title: "", description: "", category: "", clientDetails: "", photo: "" }]);
    };

    const removePortfolio = (index: number) => {
        const updated = [...portfolios];
        updated.splice(index, 1);
        setPortfolios(updated);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setProviderInfo({ ...providerInfo, photo: reader.result as string });
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const providerRes = await axios.post("/api/service-providers", providerInfo);
            const serviceProviderId = providerRes.data.id;

            await axios.post("/api/service-provider-details", {
                ...details,
                serviceProviderId,
            });

            for (const event of events) {
                await axios.post("/api/events", {
                    ...event,
                    serviceProviderId,
                });
            }

            for (const portfolio of portfolios) {
                await axios.post("/api/portfolios", {
                    ...portfolio,
                    serviceProviderId,
                });
            }

            alert("✅ Profile created successfully!");
            navigate(`/service-provider/${serviceProviderId}`);
        } catch (error) {
            console.error("❌ Error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">Register as a Service Provider</h1>

                <h2 className="text-xl font-semibold mb-3">Basic Info</h2>
                <input name="name" placeholder="Name" className="input" value={providerInfo.name ?? ""} onChange={handleProviderChange} required />
                <input name="slogan" placeholder="Slogan" className="input" value={providerInfo.slogan ?? ""} onChange={handleProviderChange} />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mb-4" />

                <h2 className="text-xl font-semibold mt-6 mb-3">Contact & Info</h2>
                <textarea name="about" placeholder="About" className="input" value={details.about ?? ""} onChange={handleDetailsChange} required />
                <textarea name="description" placeholder="Description" className="input" value={details.description ?? ""} onChange={handleDetailsChange} required />
                <input name="phone" placeholder="Phone" className="input" value={details.phone ?? ""} onChange={handleDetailsChange} required />
                <input name="email" placeholder="Email" className="input" value={details.email ?? ""} onChange={handleDetailsChange} required />
                <input name="address" placeholder="Address" className="input" value={details.address ?? ""} onChange={handleDetailsChange} />
                <input name="accountDetails" placeholder="Account Details" className="input" value={details.accountDetails ?? ""} onChange={handleDetailsChange} />
                <input name="socialMediaLink" placeholder="Social Media Link" className="input" value={details.socialMediaLink ?? ""} onChange={handleDetailsChange} />
                <input name="certificates" placeholder="Certificates" className="input" value={details.certificates ?? ""} onChange={handleDetailsChange} />
                <input name="experience" placeholder="Experience" className="input" value={details.experience ?? ""} onChange={handleDetailsChange} />

                <h2 className="text-xl font-semibold mt-6 mb-3">Services / Events Offered</h2>
                {events.map((event, index) => (
                    <div key={index} className="border p-4 rounded mb-4">
                        <input
                            placeholder="Event Name"
                            className="input"
                            value={event.name ?? ""}
                            onChange={(e) => handleEventChange(index, "name", e.target.value)}
                            required
                        />
                        <input
                            placeholder="Event Type"
                            className="input"
                            value={event.eventType ?? ""}
                            onChange={(e) => handleEventChange(index, "eventType", e.target.value)}
                            required
                        />
                        <input
                            placeholder="Price"
                            type="number"
                            className="input"
                            value={isNaN(event.price) ? "" : event.price}
                            onChange={(e) =>
                                handleEventChange(
                                    index,
                                    "price",
                                    e.target.value === "" ? 0 : parseInt(e.target.value)
                                )
                            }
                            required
                        />
                        <textarea
                            placeholder="Description"
                            className="input"
                            value={event.description ?? ""}
                            onChange={(e) => handleEventChange(index, "description", e.target.value)}
                            required
                        />
                        {events.length > 1 && (
                            <button type="button" onClick={() => removeEvent(index)} className="text-red-600 mt-2">
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addEvent} className="mb-6 bg-gray-200 px-3 py-1 rounded">
                    + Add Another Service
                </button>

                <h2 className="text-xl font-semibold mt-6 mb-3">Past Events / Portfolio</h2>
                {portfolios.map((item, index) => (
                    <div key={index} className="border p-4 rounded mb-4">
                        <input
                            placeholder="Title"
                            className="input"
                            value={item.title ?? ""}
                            onChange={(e) => handlePortfolioChange(index, "title", e.target.value)}
                            required
                        />
                        <input
                            placeholder="Category"
                            className="input"
                            value={item.category ?? ""}
                            onChange={(e) => handlePortfolioChange(index, "category", e.target.value)}
                            required
                        />
                        <input
                            placeholder="Client Details"
                            className="input"
                            value={item.clientDetails ?? ""}
                            onChange={(e) => handlePortfolioChange(index, "clientDetails", e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            className="input"
                            value={item.description ?? ""}
                            onChange={(e) => handlePortfolioChange(index, "description", e.target.value)}
                            required
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePortfolioImageUpload(index, file);
                            }}
                        />
                        {portfolios.length > 1 && (
                            <button type="button" onClick={() => removePortfolio(index)} className="text-red-600 mt-2">
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addPortfolio} className="mb-6 bg-gray-200 px-3 py-1 rounded">
                    + Add Another Past Event
                </button>

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                    Submit Profile
                </button>
            </form>
        </div>
    );
};

export default ServiceProviderDetailsPage;
