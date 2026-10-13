/**
 * Replace these demo values with approved hotel details before publishing.
 * Keep contacts empty until the hotel supplies verified information.
 */
export const HOTEL = {
  name: 'Skyview Hotel',
  // Must match public.hotels.slug in Supabase (see supabase/seed.sql).
  slug: 'skyview-uyo',
  location: 'Location to be confirmed',
  demoNotice: 'Demonstration website — hotel details, imagery, room categories and rates require owner approval.',
  contactPhone: '',
  whatsappUrl: '',
} as const;

export const FACILITIES = [
  { title: 'Wi-Fi access', description: 'Connectivity information can be confirmed with the hotel before launch.' },
  { title: 'Swimming pool', description: 'A refreshing pool setting for guests to enjoy during their stay.' },
  { title: 'Comfortable accommodation', description: 'Room categories and features can be tailored to the property.' },
  { title: 'Guest services', description: 'Reservation support and service options can be configured for the hotel.' },
  { title: 'Hot drinks (tea and coffee)', description: 'Tea and coffee for guests to enjoy during their stay, to be confirmed with the hotel.' },
  { title: 'Air conditioning', description: 'Climate control for a comfortable stay, to be confirmed with the hotel.' },
  { title: 'Broadband communication', description: 'Fast and reliable connectivity, to be confirmed with the hotel.' },
  { title: 'Chromecast', description: 'Stream your own content to the room television, to be confirmed with the hotel.' },
] as const;
