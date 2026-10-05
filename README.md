
🏨 SKYVIEW HOTELS

A modern hotel booking and guest-management platform designed to provide guests with a seamless booking experience while giving hotel staff and administrators the tools to manage rooms, reservations, services, guests, payments, and hotel operations from one centralized system.

Overview

Skyview Hotels is a full-stack hotel management and booking platform inspired by the provided UI reference.

The platform has two major sides:

Guest-facing experience

Guests can:

Browse available rooms
Filter rooms by price, amenities, and room type
View detailed room information
Make reservations
Manage upcoming and previous bookings
Request hotel services
View hotel amenities
Manage their profile
Manage payment methods
Configure booking preferences
Manage account security
Hotel management experience

Hotel staff/admins can:

Manage rooms
Manage room availability
Manage bookings
Manage guests
Manage hotel services
Manage payments
Manage check-ins/check-outs
Monitor hotel activity
Manage hotel settings
View operational statistics
🎯 Project Goals

The goal is to build a production-quality hotel platform with:

Premium modern UI
Responsive design
Fast navigation
Secure authentication
Real-time booking availability
Room management
Booking management
Payment processing
Guest management
Service requests
Role-based access control
Persistent database storage
Clean and scalable architecture

The application should feel like a real commercial hotel platform, rather than a simple CRUD project.

🎨 UI Direction

The uploaded UI reference will serve as the primary design direction.

The visual language should maintain:

Clean hotel/luxury aesthetic
White/light surfaces
Deep navy text
Blue primary accents
Soft cyan/teal backgrounds
Rounded cards
Subtle shadows
Large hotel photography
Clean typography
Spacious layouts
Minimal borders
Clear hierarchy
Premium but approachable styling

The UI should not be copied pixel-for-pixel.

Instead, we will use the reference as the design system and improve it for a real application.

🧱 Tech Stack
Frontend
React

The interface will be built with:

React
TypeScript

React will handle:

Components
Pages
Forms
UI state
Interactive elements
Reusable layouts
Framework
Next.js

We will use:

Next.js

with the App Router.

Next.js will provide:

Routing
Server components
Server actions
API endpoints
Authentication integration
SEO
Image optimization
Production deployment
🎨 Styling
Tailwind CSS

Tailwind will be used for the application's styling.

Example:

<div className="rounded-2xl border bg-white p-6 shadow-sm">

We will create reusable design tokens instead of scattering arbitrary colors throughout the application.

🧩 UI Components

We will use:

shadcn/ui

For reusable interface components such as:

Buttons
Dialogs
Dropdowns
Inputs
Selects
Tabs
Cards
Tables
Toasts
Forms
Date pickers
Sheets
Tooltips

The components will be customized to match the Skyview Hotels design.

✨ Icons
Lucide React

Icons will come from:

lucide-react

Examples:

import {
  CalendarDays,
  BedDouble,
  User,
  Settings,
  CreditCard,
  ConciergeBell
} from "lucide-react";
🎞️ Animations
Framer Motion

Used selectively for:

Page transitions
Modal animations
Card hover effects
Booking confirmation
Dashboard transitions
Mobile navigation
Loading states

Animations should remain subtle.

The application should feel premium rather than overly animated.

🗄️ Backend
Supabase

Supabase will be the primary backend.

It will provide:

PostgreSQL database
Authentication
Row Level Security
Storage
Realtime functionality
Database APIs

Architecture:

Next.js
   ↓
Supabase
   ├── PostgreSQL
   ├── Auth
   ├── Storage
   └── Realtime
🔐 Authentication

Supabase Auth will handle authentication.

Supported authentication:

Email/password
Email verification
Password reset
Session management
Logout
Protected routes

Future support can include:

Google authentication
Apple authentication
👥 User Roles

The system will have role-based permissions.

Guest

Guests can:

Browse rooms
View room details
Create bookings
View their bookings
Cancel eligible bookings
Request services
Manage their profile
Manage payment methods
Manage preferences
Receptionist

Receptionists can:

View bookings
Create bookings
Modify bookings
Check guests in
Check guests out
View guest information
Manage room availability
Handle service requests
Manager

Managers can:

Manage rooms
Manage bookings
Manage guests
Manage services
View hotel analytics
Manage staff operations
Administrator

Administrators have full access.

They can:

Manage users
Manage rooms
Manage bookings
Manage services
Manage payments
Manage hotel settings
Manage staff roles
View analytics
Configure system settings
🧭 Application Structure

The application will be organized around the following main areas.

Home
Rooms
Bookings
Services
Profile

For staff/admin:

Dashboard
Bookings
Rooms
Guests
Services
Payments
Staff
Analytics
Settings
🏠 1. Home Dashboard

The dashboard follows the first screen in the provided UI.

Sections
Welcome section

Example:

Welcome, Eleanor!

Display:

Guest name
Profile image
Current status
Quick actions
Quick Booking

Allow the user to quickly search for:

Check-in
Check-out
Guests
Room type

CTA:

Search Rooms
My Upcoming Bookings

Display:

Hotel/room
Booking date
Check-in date
Check-out date
Booking status
Manage booking button
Explore Destinations

Show destinations using image cards.

Example:

Paris
Santécal
Tokyo

This can later be connected to actual hotel locations.

Hotel Services & Amenities

Examples:

Spa
Concierge
Wellness
Gym
Room Service
Laundry
Wi-Fi
🛏️ 2. Rooms & Booking

This is one of the primary sections from the UI reference.

Users can browse available rooms.

Room filters

The filtering system should support:

Date
Check-in
Check-out
Price
Minimum price
Maximum price
Amenities
Wi-Fi
Air Conditioning
Breakfast
Pool
Parking
Spa
Gym
Room Type
Standard
Deluxe
Suite
Executive
Family
Presidential
🛏️ Room Cards

Each room card should display:

Room image
Room name
Room type
Price/night
Capacity
Amenities
Rating
Availability
Book Now

Example:

Executive Room

★★★★★

₦120,000 / night

2 Guests

King Bed
Free Wi-Fi
Breakfast

[Book Now]
🔍 Room Details

Clicking a room should open a dedicated room page.

Example:

/rooms/executive-suite

The page should contain:

Image gallery
Room name
Description
Price
Bed type
Maximum guests
Amenities
Room size
Availability
Policies
Reviews
Booking form
📅 Booking Flow

The booking flow should be:

Select Room
      ↓
Select Dates
      ↓
Select Guests
      ↓
Guest Information
      ↓
Payment
      ↓
Booking Confirmation
💳 Payment

For the Nigerian market, the primary payment provider can be:

Paystack

Payment options can include:

Card
Bank transfer
USSD
Other Paystack-supported methods

The backend must verify payment before marking a booking as paid.

📋 3. Booking Management

The UI reference contains:

Upcoming
Current Stay
Past Stays

We will maintain this structure.

Upcoming Bookings

Display:

Booking reference
Room
Guest
Check-in
Check-out
Status
Payment status

Actions:

Manage Booking
Cancel Booking
View Details
Current Stay

Show currently active reservations.

Actions:

View Booking
Request Service
Contact Concierge
Past Stays

Display previous reservations.

Actions:

View Details
Book Again
Leave Review
🧾 Booking Status

Bookings can have statuses such as:

Pending
Confirmed
Checked In
Checked Out
Cancelled
Completed
No Show
🧑‍💼 4. Services

The provided UI contains a dedicated services section.

Examples:

Spa & Wellness
Massage
Facial
Sauna
Pool
Concierge
Restaurant reservation
Transportation
Tour booking
Special requests
Local Tours
City tours
Beach trips
Cultural experiences
Airport transfers
Room Services
Food
Drinks
Laundry
Housekeeping
Extra towels
📦 Service Requests

A guest can create a service request.

Example:

Service:
Room Service

Request:
Breakfast for 2

Preferred Time:
8:00 AM

Status:

Pending
Accepted
In Progress
Completed
Cancelled
👤 5. Profile & Settings

The profile page will follow the right side of the reference UI.

Profile

Display:

Profile photo
Full name
Email
Phone number
📝 Personal Information

Fields:

First name
Last name
Email
Phone
Date of birth
Address
⚙️ Personal Settings

Options:

Personal information
Preferences
Password
Notifications
💳 Payment Methods

Users can save payment methods.

Display:

Visa
Mastercard
Bank account

Sensitive payment details should never be stored directly in our database.

Payment providers should handle payment credentials.

🛡️ Security Settings

Include:

Change password
Two-factor authentication
Active sessions
Login history
Delete account
🗃️ Database Architecture

Supabase PostgreSQL will contain tables such as:

profiles
hotels
rooms
room_types
room_amenities
amenities
bookings
booking_guests
payments
services
service_requests
reviews
notifications
favorites

For staff:

staff
roles
permissions
👤 profiles

Example structure:

id
user_id
first_name
last_name
email
phone
avatar_url
date_of_birth
address
role
created_at
updated_at
🏨 hotels
id
name
description
location
address
phone
email
logo_url
cover_image
created_at
updated_at

This allows the system to eventually support multiple hotels.

🛏️ rooms
id
hotel_id
room_type_id
room_number
floor
price_per_night
capacity
status
description
created_at
updated_at

Room status:

available
occupied
maintenance
reserved
🏷️ room_types
id
name
description
base_price
capacity
size
bed_type
created_at

Examples:

Standard Room
Deluxe Room
Executive Room
Family Suite
Presidential Suite
✨ amenities
id
name
icon
description

Examples:

Wi-Fi
Air Conditioning
Breakfast
Pool
Parking
Gym
Spa
📅 bookings
id
booking_reference
user_id
hotel_id
room_id
check_in
check_out
guests
status
payment_status
total_amount
special_requests
created_at
updated_at
💰 payments
id
booking_id
user_id
reference
provider
amount
currency
status
paid_at
created_at
🧖 services
id
hotel_id
name
category
description
price
image_url
status
created_at
🛎️ service_requests
id
booking_id
user_id
service_id
quantity
notes
status
requested_at
completed_at
⭐ reviews
id
booking_id
user_id
room_id
rating
comment
created_at
🔔 notifications
id
user_id
title
message
type
read
created_at
🔐 Row Level Security

Supabase RLS will be extremely important.

Guests should only be able to access their own:

Bookings
Payments
Service Requests
Profile
Reviews
Notifications

For example:

User A
   ↓
Can access User A bookings
Cannot access User B bookings

Admins and authorized staff will have broader access according to their roles.

📁 Project Structure

Recommended structure:

skyview-hotels/
│
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── dashboard/
│   │
│   ├── rooms/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── bookings/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── services/
│   │   └── page.tsx
│   │
│   ├── profile/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── rooms/
│   │   ├── bookings/
│   │   ├── guests/
│   │   ├── services/
│   │   ├── payments/
│   │   ├── staff/
│   │   └── settings/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── rooms/
│   ├── bookings/
│   ├── services/
│   ├── profile/
│   └── admin/
│
├── lib/
│   ├── supabase/
│   ├── payments/
│   ├── validations/
│   ├── utils/
│   └── constants/
│
├── hooks/
│
├── types/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── logos/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── docs/
│   └── ui-reference.png
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── README.md
🧩 Important Reusable Components

We should avoid putting everything directly inside page files.

Examples:

Navbar
Sidebar
UserMenu
RoomCard
RoomGallery
RoomFilters
BookingCard
BookingStatus
BookingForm
DateRangePicker
ServiceCard
ServiceRequestModal
ProfileForm
PaymentMethodCard
NotificationBell
EmptyState
LoadingState
ErrorState
ConfirmDialog

This keeps the project maintainable.

📱 Responsive Design

The application must work on:

Desktop
Laptop
Tablet
Mobile

Desktop will follow the uploaded reference most closely.

Mobile should use:

Bottom navigation
Mobile drawer
Stacked cards
Responsive filters
Full-screen booking flow
🔎 Search & Filtering

Room search should support:

Check-in
Check-out
Guests
Price
Room type
Amenities

Example:

Rooms
 ├── Standard
 ├── Deluxe
 ├── Executive
 └── Suite

Filters should update the displayed rooms dynamically.

📆 Availability Engine

One of the most important backend features is preventing double bookings.

Before confirming a booking:

Check requested dates
        ↓
Check room availability
        ↓
Check existing confirmed bookings
        ↓
If available
        ↓
Create reservation

The system must prevent:

Room 205

Oct 10 → Oct 15
        ↓
Already booked

New user cannot book
same room during overlapping dates
💳 Booking Payment Flow

Recommended flow:

User selects room
        ↓
Create pending booking
        ↓
Generate payment reference
        ↓
Open Paystack
        ↓
User pays
        ↓
Paystack webhook
        ↓
Verify transaction
        ↓
Update payment
        ↓
Confirm booking
        ↓
Send confirmation

Never rely solely on the frontend payment callback.

The backend must verify the transaction.

📧 Notifications

The system should eventually send:

Booking confirmation
Your booking has been confirmed.
Payment confirmation
Payment received successfully.
Upcoming check-in
Your stay begins tomorrow.
Cancellation
Your booking has been cancelled.

Potential email provider:

Resend
📊 Admin Dashboard

The admin dashboard should provide hotel statistics.

Example:

Total Rooms
Available Rooms
Occupied Rooms
Today's Check-ins
Today's Check-outs
Upcoming Bookings
Revenue
Pending Requests

Charts can include:

Revenue
Bookings
Occupancy
Room performance
🏨 Hotel Operations

Admin/receptionist dashboard:

ROOM 101
Available

ROOM 102
Occupied

ROOM 103
Cleaning

ROOM 104
Maintenance

This gives hotel staff an operational view of the property.

🧹 Housekeeping

Future module:

Clean
Dirty
Cleaning
Inspected
Maintenance

Staff can update room status after checkout.

Example:

Guest checks out
       ↓
Room → Cleaning
       ↓
Housekeeping completes
       ↓
Room → Available
🔒 Security

Security requirements:

Supabase authentication
Row Level Security
Protected routes
Server-side authorization
Environment variables
Payment verification
Input validation
Rate limiting where necessary
Secure database policies
No secret keys in frontend code

Never expose:

SUPABASE_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY

in client-side code.

🧪 Validation

Use:

Zod

For validating:

Booking forms
Profile forms
Authentication forms
Service requests
Admin forms

Example:

const bookingSchema = z.object({
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1),
});
🧰 Additional Libraries

Recommended dependencies:

next
react
typescript
tailwindcss
@supabase/supabase-js
@supabase/ssr
lucide-react
framer-motion
zod
react-hook-form
date-fns

For charts:

recharts

For payments:

Paystack
🌐 Environment Variables

Create:

.env.local

Example:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

NEXT_PUBLIC_APP_URL=

If email notifications are added:

RESEND_API_KEY=
🚀 Installation

Clone the repository:

git clone <repository-url>

Enter the project:

cd skyview-hotels

Install dependencies:

npm install

Run development server:

npm run dev

Open:

http://localhost:3000
🗄️ Supabase Setup

Create a Supabase project.

Then configure:

Authentication
Database
Storage
RLS

Create database migrations inside:

supabase/migrations/

Seed development data:

supabase/seed.sql

Development rooms can include:

Standard Room
Deluxe Room
Executive Room
Family Suite
Presidential Suite
🖼️ Image Storage

Hotel images should be stored in Supabase Storage.

Buckets:

hotel-images
room-images
service-images
avatars

Room images can then be referenced using URLs stored in the database.

🧭 Development Roadmap
Phase 1 — Project Setup
 Create Next.js application
 Configure TypeScript
 Configure Tailwind
 Install shadcn/ui
 Install Lucide
 Install Framer Motion
 Configure Supabase
 Create project structure
 Establish design tokens
Phase 2 — UI Foundation
 Navbar
 Sidebar
 User dropdown
 Buttons
 Cards
 Forms
 Modal system
 Toast system
 Responsive layout
 Loading states
 Empty states
Phase 3 — Authentication
 Sign up
 Sign in
 Sign out
 Email verification
 Forgot password
 Reset password
 Protected routes
 User profiles
 Role management
Phase 4 — Rooms
 Room listing
 Room cards
 Room filters
 Room details
 Room gallery
 Amenities
 Availability
 Room categories
Phase 5 — Booking System
 Date selection
 Guest selection
 Booking form
 Availability validation
 Booking creation
 Booking reference
 Booking history
 Cancellation
Phase 6 — Payments
 Paystack integration
 Payment initialization
 Payment verification
 Webhooks
 Payment records
 Booking confirmation
Phase 7 — Services
 Services page
 Service categories
 Service requests
 Request status
 Staff management
Phase 8 — Profile
 Personal information
 Avatar upload
 Payment methods
 Preferences
 Security
 Notifications
Phase 9 — Admin
 Admin dashboard
 Room management
 Booking management
 Guest management
 Service management
 Payment management
 Staff management
 Analytics
Phase 10 — Hotel Operations
 Check-in
 Check-out
 Housekeeping
 Room status
 Maintenance
 Concierge
 Notifications
Phase 11 — Testing

Test:

 Authentication
 Booking flow
 Date validation
 Double booking prevention
 Payment verification
 Role permissions
 Mobile UI
 Admin operations
 Error handling
🚀 Deployment

Frontend:

Vercel

Backend:

Supabase

Payment:

Paystack

Images:

Supabase Storage

Email:

Resend

Architecture:

                    ┌───────────────┐
                    │    Vercel     │
                    │   Next.js     │
                    └───────┬───────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
        Supabase        Paystack        Resend
        Database        Payments         Email
             │
       ┌─────┴─────┐
       │           │
      Auth       Storage
📈 Future Features

After the core application is complete, we can add:

Multiple hotels
Loyalty points
Discount codes
Promotional campaigns
Reviews
Hotel comparison
Wishlist/favorites
AI concierge
WhatsApp notifications
SMS notifications
Airport transfer booking
Restaurant reservations
Housekeeping management
Staff scheduling
Revenue analytics
Occupancy forecasting
Multi-currency support
Multi-language support
🎯 MVP Definition

The first production-ready version should focus on:

Authentication
        ↓
Dashboard
        ↓
Rooms
        ↓
Room Details
        ↓
Booking
        ↓
Payment
        ↓
Booking Management
        ↓
Services
        ↓
Profile

Then we build:

Admin
        ↓
Reception
        ↓
Housekeeping
        ↓
Analytics

This prevents us from trying to build the entire hotel ecosystem at once.

🏆 Definition of Done

The project is considered MVP-complete when a guest can:

Create account
      ↓
Login
      ↓
Browse rooms
      ↓
Filter rooms
      ↓
View room
      ↓
Select dates
      ↓
Make booking
      ↓
Pay
      ↓
Receive confirmation
      ↓
View booking
      ↓
Request hotel service
      ↓
Manage profile

And hotel staff can:

Login
  ↓
View dashboard
  ↓
View bookings
  ↓
Manage rooms
  ↓
Manage guests
  ↓
Manage service requests
  ↓
Check guests in/out
💡 Development Principle

The most important rule for this project:

Build the UI from the reference first, then connect real functionality behind it.

We shouldn't start by dumping everything into one giant page.

We'll build it as a proper product:

Design System
      ↓
Reusable Components
      ↓
Pages
      ↓
Database
      ↓
Authentication
      ↓
Business Logic
      ↓
Payments
      ↓
Admin Operations
      ↓
Testing
      ↓
Deployment