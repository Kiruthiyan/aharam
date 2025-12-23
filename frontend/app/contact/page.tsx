"use client";

import Navbar from "@/components/Navbar";
import { MoveRight, Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="grid lg:grid-cols-2 min-h-[calc(100vh-80px)]">
                <div className="bg-emerald-900 p-12 lg:p-24 text-white flex flex-col justify-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-8">எம்மைத் தொடர்புகொள்ள</h1>
                    <p className="text-emerald-100 text-lg mb-12">
                        நீங்கள் விண்ணப்பம் அல்லது மேலதிக தகவல்களை அறிய விரும்பினால் எங்களை தொடர்பு கொள்ளவும்.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start">
                            <Phone className="h-6 w-6 mt-1 text-emerald-400 mr-4" />
                            <div>
                                <h3 className="font-bold text-lg">தொலைபேசி</h3>
                                <p className="text-emerald-100">+94 77 123 4567</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Mail className="h-6 w-6 mt-1 text-emerald-400 mr-4" />
                            <div>
                                <h3 className="font-bold text-lg">மின்னஞ்சல்</h3>
                                <p className="text-emerald-100">info@aharamcollege.com</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <MapPin className="h-6 w-6 mt-1 text-emerald-400 mr-4" />
                            <div>
                                <h3 className="font-bold text-lg">முகவரி</h3>
                                <p className="text-emerald-100">எண் 123, பிரதான வீதி, யாழ்ப்பாணம்</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-12 lg:p-24 flex items-center justify-center bg-gray-50">
                    <form className="w-full max-w-md space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">பெயர் (Name)</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="உங்கள் பெயர்" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">மின்னஞ்சல் (Email)</label>
                            <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">தகவல் (Message)</label>
                            <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="உங்கள் செய்தி..."></textarea>
                        </div>
                        <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center">
                            அனுப்புக (Send Message)
                            <MoveRight className="ml-2 h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
