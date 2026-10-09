'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Camera, Check, ImagePlus, Lock, LogOut, Mail, MapPin, Phone, Sparkles, User, X } from 'lucide-react';
import { saveGuestAvatar, saveGuestProfile, useGuestProfile, type GuestProfile } from '@/lib/guest-profile';
import { createClient } from '@/lib/supabase/client';

function canvasToWebp(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((image) => {
      if (image) resolve(image);
      else reject(new Error('Could not process this photo. Please try another image.'));
    }, 'image/webp', 0.85);
  });
}

async function resizeImage(image: ImageBitmap) {
  const scale = Math.min(1, 1024 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not process this photo.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return canvasToWebp(canvas);
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, avatarUrl, ready, authenticated, error: storageError } = useGuestProfile();
  const [draft, setDraft] = useState<GuestProfile | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentProfile = draft ?? profile;

  const updateField = (field: keyof GuestProfile, value: string) => {
    setDraft((current) => ({ ...(current ?? profile), [field]: value }));
    setSavedSuccess(false);
    setSaveError(null);
  };

  useEffect(() => {
    if (ready && !authenticated) router.replace('/sign-in');
  }, [authenticated, ready, router]);

  useEffect(() => {
    if (videoRef.current && cameraStream) videoRef.current.srcObject = cameraStream;
    return () => cameraStream?.getTracks().forEach((track) => track.stop());
  }, [cameraStream]);

  const savePhoto = async (image: Blob) => {
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const signedUrl = await saveGuestAvatar(image);
      setAvatarPreview(signedUrl);
      setPhotoMenuOpen(false);
      setCameraOpen(false);
      setCameraStream(null);
    } catch (error: unknown) {
      setAvatarError(error instanceof Error ? error.message : 'Unable to save your profile photo.');
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Choose an image file to use as your profile photo.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setAvatarError('Choose a photo smaller than 15 MB.');
      return;
    }

    try {
      const image = await createImageBitmap(file);
      const webp = await resizeImage(image);
      await savePhoto(webp);
    } catch (error: unknown) {
      setAvatarError(error instanceof Error ? error.message : 'Unable to read this image.');
    }
  };

  const startCamera = async () => {
    setAvatarError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setAvatarError('Camera capture is not supported by this browser. Choose a photo from your device instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
      });
      setCameraStream(stream);
      setPhotoMenuOpen(false);
      setCameraOpen(true);
    } catch (error: unknown) {
      setAvatarError(error instanceof Error ? error.message : 'Camera access was unavailable.');
      setPhotoMenuOpen(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setAvatarError('The camera is not ready yet. Please wait and try again.');
      return;
    }
    const scale = Math.min(1, 1024 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      setAvatarError('Your browser could not process the camera photo.');
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      await savePhoto(await canvasToWebp(canvas));
    } catch (error: unknown) {
      setAvatarError(error instanceof Error ? error.message : 'Unable to capture this photo.');
    }
  };

  const closeCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveGuestProfile(currentProfile);
      setSavedSuccess(true);
      setSaveError(null);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save your profile in this browser.');
    }
  };

  const handleSignOut = async () => {
    setSignOutError(null);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.replace('/sign-in');
      router.refresh();
    } catch (error: unknown) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  const fullName = `${currentProfile.firstName} ${currentProfile.lastName}`.trim();
  const initials = fullName
    ? fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'G';

  if (!ready || !authenticated) {
    return (
      <DashboardLayout>
        <p className="py-12 text-center text-sm text-slate-500" role="status">Checking your guest account…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Guest Experience
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details and contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm text-center">
            <div className="relative h-24 w-24 mx-auto mb-4">
              {avatarPreview || avatarUrl ? (
                <img
                  src={avatarPreview ?? avatarUrl ?? ''}
                  alt={`${fullName || 'Guest'} profile`}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-sky-100 shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700 ring-4 ring-sky-100 shadow-md">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setAvatarError(null);
                  setPhotoMenuOpen(true);
                }}
                aria-label="Change profile photo"
                title="Change profile photo"
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-white shadow transition hover:bg-sky-700"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            {avatarBusy && <p className="mb-2 text-xs text-sky-700" role="status">Saving photo…</p>}
            {avatarError && <p className="mb-3 text-xs font-medium text-rose-700" role="alert">{avatarError}</p>}
            <h3 className="text-lg font-bold text-slate-900">{fullName || 'Guest'}</h3>
            <p className="text-xs text-slate-500">{currentProfile.email || 'Add your email address'}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              Your profile details appear here after you save them.
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" /> Profile Storage
            </h4>
            <p className="text-xs leading-relaxed text-slate-500">
              Profile details are saved in this browser&apos;s local storage. They are not synced to other devices or used for authentication.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>

            {!ready && <p className="text-xs text-slate-500" role="status">Loading saved profile…</p>}
            {storageError && (
              <div role="alert" className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
                Could not load your guest profile: {storageError}
              </div>
            )}
            {saveError && (
              <div role="alert" className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
                {saveError}
              </div>
            )}
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2" role="status">
                <Check className="w-4 h-4" /> Changes saved successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-xs font-semibold text-slate-700 block mb-1">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="firstName"
                    type="text"
                    value={currentProfile.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    autoComplete="given-name"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="text-xs font-semibold text-slate-700 block mb-1">Last Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="lastName"
                    type="text"
                    value={currentProfile.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    autoComplete="family-name"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={currentProfile.email}
                    readOnly
                    autoComplete="email"
                    aria-describedby="email-help"
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500"
                  />
                </div>
                <p id="email-help" className="mt-1 text-[11px] text-slate-500">Your sign-in email is managed by your account.</p>
              </div>
              <div>
                <label htmlFor="phone" className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={currentProfile.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    autoComplete="tel"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="text-xs font-semibold text-slate-700 block mb-1">Residential Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="address"
                  type="text"
                  value={currentProfile.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  autoComplete="street-address"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={!ready}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Profile Changes
              </button>
            </div>
          </form>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" /> Security & Access
            </h3>
            <p className="text-xs text-slate-500">
              Your password is managed securely by Supabase. Sign out to end this guest session on this device.
            </p>
            {signOutError && <p role="alert" className="mt-3 text-xs font-semibold text-rose-700">{signOutError}</p>}
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {photoMenuOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPhotoMenuOpen(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="photo-dialog-title" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="photo-dialog-title" className="text-base font-bold text-slate-900">Change profile photo</h2>
              <button type="button" onClick={() => setPhotoMenuOpen(false)} aria-label="Close photo options" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3">
              {avatarError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">{avatarError}</p>}
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-sky-300 hover:bg-sky-50"
              >
                <ImagePlus className="h-5 w-5 text-sky-600" />
                <span><strong className="block text-sm text-slate-800">Upload from gallery</strong><small className="text-xs text-slate-500">Choose an image saved on your device</small></span>
              </button>
              <button
                type="button"
                onClick={() => void startCamera()}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-sky-300 hover:bg-sky-50"
              >
                <Camera className="h-5 w-5 text-sky-600" />
                <span><strong className="block text-sm text-slate-800">Take a photo</strong><small className="text-xs text-slate-500">Use your device camera</small></span>
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void handleImageUpload(event)}
                className="hidden"
                aria-label="Choose a profile photo"
              />
            </div>
          </section>
        </div>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="camera-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="camera-dialog-title" className="text-base font-bold text-slate-900">Take a profile photo</h2>
              <button type="button" onClick={closeCamera} aria-label="Close camera" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline className="max-h-[60vh] w-full rounded-xl bg-slate-950 object-cover" />
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={closeCamera} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => void capturePhoto()} disabled={avatarBusy} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-60">
                <Camera className="h-4 w-4" /> {avatarBusy ? 'Saving…' : 'Capture photo'}
              </button>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
