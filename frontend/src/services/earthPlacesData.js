export const PLACE_CATEGORIES = [
  { id: 'all', name: 'All Places', icon: '🌐' },
  { id: 'wonders', name: 'Wonders & Landmarks', icon: '🏛️' },
  { id: 'tech', name: 'Tech & Innovation Hubs', icon: '💻' },
  { id: 'nature', name: 'Nature & Mountains', icon: '🏔️' },
  { id: 'cities', name: 'Capitals & Megacities', icon: '🏙️' },
  { id: 'airports', name: 'Global Airports', icon: '✈️' },
];

export const EARTH_PLACES = [
  {
    id: 'p-1',
    name: 'Eiffel Tower',
    category: 'wonders',
    categoryName: 'Wonders & Landmarks',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    lat: 48.8584,
    lng: 2.2945,
    elevation: '330 meters',
    timezone: 'Europe/Paris (UTC+2)',
    rating: 4.8,
    reviewsCount: 342000,
    weather: { temp: '22°C', condition: 'Sunny', wind: '12 km/h', humidity: '55%' },
    description: 'Wrought-iron lattice tower on the Champ de Mars in Paris, France. Named after engineer Gustave Eiffel, it is one of the most recognizable structures in the world.',
    photos: [
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Eiffel_Tower',
    nearbyPois: [
      { name: 'Louvre Museum', type: 'Museum', dist: '2.8 km' },
      { name: 'Arc de Triomphe', type: 'Monument', dist: '2.2 km' },
      { name: 'Le Jules Verne Restaurant', type: 'Dining', dist: '0.1 km' }
    ]
  },
  {
    id: 'p-2',
    name: 'Taj Mahal',
    category: 'wonders',
    categoryName: 'Wonders & Landmarks',
    city: 'Agra',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    lat: 27.1751,
    lng: 78.0421,
    elevation: '171 meters',
    timezone: 'Asia/Kolkata (UTC+5:30)',
    rating: 4.9,
    reviewsCount: 285000,
    weather: { temp: '31°C', condition: 'Clear Sky', wind: '8 km/h', humidity: '60%' },
    description: 'An immense mausoleum of white marble built in Agra between 1631 and 1648 by order of the Mughal emperor Shah Jahan in memory of his favorite wife Mumtaz Mahal.',
    photos: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Taj_Mahal',
    nearbyPois: [
      { name: 'Agra Fort', type: 'Historical', dist: '2.5 km' },
      { name: 'Mehtab Bagh', type: 'Garden', dist: '1.2 km' },
      { name: 'Peshawri Fine Dining', type: 'Dining', dist: '3.4 km' }
    ]
  },
  {
    id: 'p-3',
    name: 'Statue of Liberty',
    category: 'wonders',
    categoryName: 'Wonders & Landmarks',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    lat: 40.6892,
    lng: -74.0445,
    elevation: '93 meters',
    timezone: 'America/New_York (UTC-4)',
    rating: 4.7,
    reviewsCount: 198000,
    weather: { temp: '25°C', condition: 'Partly Cloudy', wind: '16 km/h', humidity: '50%' },
    description: 'Colossal neoclassical sculpture on Liberty Island in New York Harbor. Designed by Frédéric-Auguste Bartholdi and dedicated in 1886.',
    photos: [
      'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485871981521-5b1017957861?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Statue_of_Liberty',
    nearbyPois: [
      { name: 'Ellis Island Immigration Museum', type: 'Museum', dist: '1.1 km' },
      { name: 'Battery Park', type: 'Park', dist: '2.6 km' },
      { name: 'One World Trade Center', type: 'Skyscraper', dist: '3.8 km' }
    ]
  },
  {
    id: 'p-4',
    name: 'Colosseum',
    category: 'wonders',
    categoryName: 'Wonders & Landmarks',
    city: 'Rome',
    country: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    lat: 41.8902,
    lng: 12.4922,
    elevation: '22 meters',
    timezone: 'Europe/Rome (UTC+2)',
    rating: 4.8,
    reviewsCount: 310000,
    weather: { temp: '27°C', condition: 'Sunny', wind: '10 km/h', humidity: '45%' },
    description: 'An oval amphitheatre in the centre of Rome, Italy. Built of travertine limestone, tuff, and brick-faced concrete, it was the largest amphitheatre ever built.',
    photos: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Colosseum',
    nearbyPois: [
      { name: 'Roman Forum', type: 'Ruins', dist: '0.4 km' },
      { name: 'Palatine Hill', type: 'Park', dist: '0.6 km' },
      { name: 'Aroma Restaurant', type: 'Dining', dist: '0.2 km' }
    ]
  },
  {
    id: 'p-5',
    name: 'Silicon Valley Apple Park',
    category: 'tech',
    categoryName: 'Tech & Innovation Hubs',
    city: 'Cupertino, CA',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    lat: 37.3318,
    lng: -122.0312,
    elevation: '72 meters',
    timezone: 'America/Los_Angeles (UTC-7)',
    rating: 4.8,
    reviewsCount: 45000,
    weather: { temp: '24°C', condition: 'Sunny', wind: '11 km/h', humidity: '48%' },
    description: 'The global heart of technology, software innovation, microprocessors, and artificial intelligence pioneering in Northern California.',
    photos: [
      'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Silicon_Valley',
    nearbyPois: [
      { name: 'Apple Park Visitor Center', type: 'Tech', dist: '0.2 km' },
      { name: 'Computer History Museum', type: 'Museum', dist: '12 km' },
      { name: 'Stanford University', type: 'University', dist: '16 km' }
    ]
  },
  {
    id: 'p-6',
    name: 'Tokyo Tower & Akihabara',
    category: 'cities',
    categoryName: 'Capitals & Megacities',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    lat: 35.6586,
    lng: 139.7454,
    elevation: '333 meters',
    timezone: 'Asia/Tokyo (UTC+9)',
    rating: 4.8,
    reviewsCount: 220000,
    weather: { temp: '26°C', condition: 'Clear', wind: '9 km/h', humidity: '62%' },
    description: 'A communications and observation tower in the Shiba-koen district of Minato, Tokyo, Japan. Modeled on the Eiffel Tower and painted white and international orange.',
    photos: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Tokyo_Tower',
    nearbyPois: [
      { name: 'Zojoji Temple', type: 'Temple', dist: '0.3 km' },
      { name: 'Roppongi Hills', type: 'Shopping', dist: '1.5 km' },
      { name: 'Akihabara Electric Town', type: 'Electronics', dist: '6.2 km' }
    ]
  },
  {
    id: 'p-7',
    name: 'Mount Everest Base Camp',
    category: 'nature',
    categoryName: 'Nature & Mountains',
    city: 'Khumbu',
    country: 'Nepal',
    countryCode: 'NP',
    flag: '🇳🇵',
    lat: 27.9881,
    lng: 86.9250,
    elevation: '5,364 meters',
    timezone: 'Asia/Kathmandu (UTC+5:45)',
    rating: 4.9,
    reviewsCount: 38000,
    weather: { temp: '-4°C', condition: 'Snowy & Crisp', wind: '35 km/h', humidity: '70%' },
    description: 'The highest mountain peak on Earth above sea level, located in the Mahalangur Himal sub-range of the Himalayas.',
    photos: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Mount_Everest',
    nearbyPois: [
      { name: 'Kala Patthar Peak', type: 'Viewpoint', dist: '3.2 km' },
      { name: 'Gorakshep Lodge', type: 'Trek Camp', dist: '4.5 km' },
      { name: 'Khumbu Icefall', type: 'Glacier', dist: '1.0 km' }
    ]
  },
  {
    id: 'p-8',
    name: 'Burj Khalifa',
    category: 'wonders',
    categoryName: 'Wonders & Landmarks',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    lat: 25.1972,
    lng: 55.2744,
    elevation: '828 meters',
    timezone: 'Asia/Dubai (UTC+4)',
    rating: 4.9,
    reviewsCount: 360000,
    weather: { temp: '36°C', condition: 'Sunny & Warm', wind: '14 km/h', humidity: '40%' },
    description: 'The world\'s tallest architectural structure standing at 828 meters in Dubai, UAE, featuring 163 floors and high-speed double-deck elevators.',
    photos: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Burj_Khalifa',
    nearbyPois: [
      { name: 'Dubai Mall', type: 'Shopping', dist: '0.3 km' },
      { name: 'The Dubai Fountain', type: 'Attraction', dist: '0.2 km' },
      { name: 'At.mosphere Restaurant', type: 'Fine Dining', dist: '0.0 km' }
    ]
  },
  {
    id: 'p-9',
    name: 'Machu Picchu',
    category: 'wonders',
    categoryName: 'Wonders & Landmarks',
    city: 'Cusco',
    country: 'Peru',
    countryCode: 'PE',
    flag: '🇵🇪',
    lat: -13.1631,
    lng: -72.5450,
    elevation: '2,430 meters',
    timezone: 'America/Lima (UTC-5)',
    rating: 4.9,
    reviewsCount: 175000,
    weather: { temp: '19°C', condition: 'Mist & Sun', wind: '7 km/h', humidity: '65%' },
    description: '15th-century Inca citadel set high in the Andes Mountains in Peru, above the Urubamba River valley.',
    photos: [
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509299349698-ab22323ae696?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Machu_Picchu',
    nearbyPois: [
      { name: 'Huayna Picchu Peak', type: 'Mountain', dist: '1.2 km' },
      { name: 'Sun Gate (Inti Punku)', type: 'Ruins', dist: '2.4 km' },
      { name: 'Aguas Calientes Town', type: 'Transit', dist: '8.0 km' }
    ]
  },
  {
    id: 'p-10',
    name: 'Sydney Opera House',
    category: 'wonders',
    categoryName: 'Wonders & Landmarks',
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    lat: -33.8568,
    lng: 151.2153,
    elevation: '4 meters',
    timezone: 'Australia/Sydney (UTC+10)',
    rating: 4.8,
    reviewsCount: 190000,
    weather: { temp: '20°C', condition: 'Ocean Breeze', wind: '18 km/h', humidity: '58%' },
    description: 'Multi-venue performing arts centre in Sydney. Located on the foreshore of Sydney Harbour, it is widely regarded as one of the world\'s most famous buildings.',
    photos: [
      'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Sydney_Opera_House',
    nearbyPois: [
      { name: 'Sydney Harbour Bridge', type: 'Bridge', dist: '1.0 km' },
      { name: 'Royal Botanic Garden', type: 'Park', dist: '0.6 km' },
      { name: 'Bennelong Restaurant', type: 'Dining', dist: '0.1 km' }
    ]
  },
  {
    id: 'p-11',
    name: 'Bengaluru Tech & Science Hub',
    category: 'tech',
    categoryName: 'Tech & Innovation Hubs',
    city: 'Bengaluru',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    lat: 12.9716,
    lng: 77.5946,
    elevation: '920 meters',
    timezone: 'Asia/Kolkata (UTC+5:30)',
    rating: 4.7,
    reviewsCount: 88000,
    weather: { temp: '28°C', condition: 'Pleasant', wind: '12 km/h', humidity: '52%' },
    description: 'Known as the Silicon Valley of Asia, home to premier aerospace, software development, AI engineering, and research universities.',
    photos: [
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bangalore',
    nearbyPois: [
      { name: 'Indian Institute of Science (IISc)', type: 'University', dist: '6.5 km' },
      { name: 'Cubbon Park', type: 'Park', dist: '1.2 km' },
      { name: 'Electronic City Tech Hub', type: 'Tech', dist: '18 km' }
    ]
  },
  {
    id: 'p-12',
    name: 'Grand Canyon National Park',
    category: 'nature',
    categoryName: 'Nature & Mountains',
    city: 'Arizona',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    lat: 36.1069,
    lng: -112.1129,
    elevation: '2,000 meters',
    timezone: 'America/Phoenix (UTC-7)',
    rating: 4.9,
    reviewsCount: 230000,
    weather: { temp: '30°C', condition: 'Sunny', wind: '14 km/h', humidity: '25%' },
    description: 'A steep-sided canyon carved by the Colorado River in Arizona. It is 277 miles long, up to 18 miles wide and attains a depth of over a mile.',
    photos: [
      'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Grand_Canyon',
    nearbyPois: [
      { name: 'Mather Point Viewpoint', type: 'Viewpoint', dist: '1.5 km' },
      { name: 'Bright Angel Trail', type: 'Hiking', dist: '0.8 km' },
      { name: 'Grand Canyon Village', type: 'Resort', dist: '3.0 km' }
    ]
  },
  {
    id: 'p-13',
    name: 'London Eye & Big Ben',
    category: 'cities',
    categoryName: 'Capitals & Megacities',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    lat: 51.5007,
    lng: -0.1246,
    elevation: '11 meters',
    timezone: 'Europe/London (UTC+1)',
    rating: 4.7,
    reviewsCount: 290000,
    weather: { temp: '19°C', condition: 'Overcast', wind: '15 km/h', humidity: '68%' },
    description: 'Iconic Elizabeth Tower clock tower and giant cantilevered observation wheel situated on the South Bank of the River Thames in London.',
    photos: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Big_Ben',
    nearbyPois: [
      { name: 'Westminster Abbey', type: 'Cathedral', dist: '0.4 km' },
      { name: 'Buckingham Palace', type: 'Palace', dist: '1.4 km' },
      { name: 'Trafalgar Square', type: 'Plaza', dist: '1.0 km' }
    ]
  },
  {
    id: 'p-14',
    name: 'London Heathrow Airport (LHR)',
    category: 'airports',
    categoryName: 'Global Airports',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    lat: 51.4700,
    lng: -0.4543,
    elevation: '25 meters',
    timezone: 'Europe/London (UTC+1)',
    rating: 4.4,
    reviewsCount: 140000,
    weather: { temp: '18°C', condition: 'Light Rain', wind: '20 km/h', humidity: '72%' },
    description: 'Major international airport in London, England. It is one of the busiest airports in the world by international passenger traffic.',
    photos: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'
    ],
    heroImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Heathrow_Airport',
    nearbyPois: [
      { name: 'Heathrow Terminal 5 Station', type: 'Transit', dist: '0.5 km' },
      { name: 'Windsor Castle', type: 'Historical', dist: '11.5 km' }
    ]
  }
];

export const PRESET_ROUTES = [
  {
    id: 'r-1',
    name: 'Trans-European Cultural Highway',
    originId: 'p-13', // London
    destinationId: 'p-1', // Paris
    mode: 'driving',
    distanceKm: 465,
    durationText: '5 hrs 45 mins',
    elevationProfile: [11, 45, 80, 110, 35, 330],
    waypoints: [
      { lat: 51.5007, lng: -0.1246, name: 'London, UK' },
      { lat: 51.0504, lng: 2.3789, name: 'Dunkirk, France' },
      { lat: 48.8584, lng: 2.2945, name: 'Eiffel Tower, Paris' }
    ],
    steps: [
      'Head south-east on A20 toward Folkestone',
      'Take the Eurotunnel Le Shuttle train across the English Channel',
      'Continue on A16 highway toward Paris',
      'Merge onto Boulevard Périphérique into Paris city center',
      'Arrive at Eiffel Tower, Champ de Mars'
    ]
  },
  {
    id: 'r-2',
    name: 'California Tech Expressway',
    originId: 'p-5', // Apple Park
    destinationId: 'p-3', // NYC
    mode: 'driving',
    distanceKm: 4680,
    durationText: '42 hours',
    elevationProfile: [72, 1600, 2500, 300, 93],
    waypoints: [
      { lat: 37.3318, lng: -122.0312, name: 'Silicon Valley, CA' },
      { lat: 39.7392, lng: -104.9903, name: 'Denver, CO' },
      { lat: 40.6892, lng: -74.0445, name: 'Statue of Liberty, NY' }
    ],
    steps: [
      'Depart Apple Park on I-80 East',
      'Cross the Rocky Mountains via I-70 East',
      'Continue through Chicago metro area on I-80 East',
      'Cross New Jersey Turnpike toward Manhattan',
      'Arrive at Battery Park / Liberty Island Ferry'
    ]
  }
];
