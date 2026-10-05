'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { User, Mail, Phone, MapPin, Shield, CreditCard, Bell, Sparkles, Check, Lock } from 'lucide-react';

export default function ProfilePage() {
  const [firstName, setFirstName] = useState('Eleanor');
  const [lastName, setLastName] = useState('Vance');
  const [email, setEmail] = useState('eleanor.vance@example.com');
  const [phone, setPhone] = useState('+234 812 345 6789');
  const [address, setAddress] = useState('14 Victoria Island Promenade, Lagos');
  const [currency, setCurrency] = useState('NGN');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Guest Experience
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & VIP Guest Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, stay preferences, and payment credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column: VIP Card & Avatar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="Profile"
                className="w-full h-full object-cover rounded-full ring-4 ring-sky-100 shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">{firstName} {lastName}</h3>
            <p className="text-xs text-slate-500">{email}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-around text-xs">
              <div>
                <span className="text-slate-400 block">Stays</span>
                <span className="font-extrabold text-slate-900 text-sm">4 Visits</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div>
                <span className="text-slate-400 block">Skyview Tier</span>
                <span className="font-extrabold text-sky-600 text-sm">Gold VIP</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" /> Saved Payment Methods
            </h4>
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md mb-3">
              <div className="flex justify-between items-center text-xs opacity-75 mb-4">
                <span>Skyview Express Card</span>
                <span className="font-bold">Mastercard</span>
              </div>
              <div className="font-mono text-sm tracking-wider mb-2">•••• •••• •••• 4291</div>
              <div className="flex justify-between text-[11px] opacity-75">
                <span>{firstName.toUpperCase()} {lastName.toUpperCase()}</span>
                <span>EXP 08/29</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Edit Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" /> Changes saved successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Last Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Residential Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Save Profile Changes
              </button>
            </div>
          </form>

          {/* Security & Password */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" /> Security & Access
            </h3>
            <p className="text-xs text-slate-500 mb-4">Manage password updates and two-factor verification</p>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-slate-500">Protect reservation records with SMS/Authenticator</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-sky-600 font-semibold text-xs rounded-lg hover:bg-sky-50 transition">
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}