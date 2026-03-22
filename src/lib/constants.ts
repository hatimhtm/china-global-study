export const DOCUMENT_TYPES = [
  'Passport',
  'Transcript',
  'Diploma',
  'Medical Form',
  'Photo',
  'Visa Application',
  'Admission Letter',
  'Recommendation Letter',
  'Language Certificate',
  'Bank Statement',
  'Other',
];

export const APPLICATION_STATUSES = [
  'Inquiry',
  'Documents Collecting',
  'Submitted',
  'Under Review',
  'Accepted',
  'Visa Processing',
  'Enrolled',
  'Rejected',
] as const;

export const DEGREE_LEVELS = ['Bachelor', 'Master', 'Doctoral', 'Language Program'];

export const TASK_CATEGORIES = ['Pre-Departure', 'Arrival', 'Documentation', 'General'] as const;

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'] as const;

export const PROGRAM_STATUSES = ['Available', 'Expired', 'Full'] as const;

export const INTAKE_SEASONS = ['Fall', 'Spring'] as const;

export const DEFAULT_MAD_RATE = 1.38; // 1 CNY ≈ 1.38 MAD

export const TUTORIAL_STEPS = [
  {
    target: '#sidebar-dashboard',
    title: 'Welcome to China Global Study! 🎓',
    content: 'This is your command center. The Dashboard gives you an overview of all available program offers.',
    placement: 'right' as const,
  },
  {
    target: '#sidebar-universities',
    title: 'Universities',
    content: 'Browse and compare partnered universities. Add new ones and manage your institutional network.',
    placement: 'right' as const,
  },
  {
    target: '#sidebar-pipeline',
    title: 'Application Pipeline',
    content: 'Track student applications with a Kanban board. Drag cards between columns to update their status.',
    placement: 'right' as const,
  },
  {
    target: '#sidebar-documents',
    title: 'Document Tracking',
    content: 'Monitor document submission status for each applicant. Click to cycle through statuses.',
    placement: 'right' as const,
  },
  {
    target: '#sidebar-cities',
    title: 'City Guides',
    content: 'Essential information about living in Chinese cities — apps, accommodation, transportation, and more.',
    placement: 'right' as const,
  },
  {
    target: '#sidebar-tasks',
    title: 'Task Checklist',
    content: 'Create to-do lists for pre-departure and arrival. Tag specific applicants or keep tasks global.',
    placement: 'right' as const,
  },
  {
    target: '#new-entry-btn',
    title: 'Add New Program Offers',
    content: 'Click here to add a new program offer. You\'ll select a university and fill in the program details in one form.',
    placement: 'top' as const,
  },
  {
    target: '#view-toggle',
    title: 'Switch Views',
    content: 'Toggle between a clean Card view and a detailed Spreadsheet view anytime.',
    placement: 'bottom' as const,
  },
];

export const CITY_GUIDES_SEED = [
  {
    city_name: 'Beijing',
    province: 'Beijing Municipality',
    description: 'China\'s capital and political center, home to world-class universities like Tsinghua and Peking University. Rich in history with the Forbidden City, Great Wall, and vibrant modern culture.',
    population: '21.5 million',
    climate: 'Four distinct seasons. Cold, dry winters (-5°C to 5°C). Hot, humid summers (25°C to 35°C). Best seasons: Spring (April-May) and Autumn (September-October).',
    cost_of_living: 'Moderate to High. Rent: ¥2,500-5,000/month for shared accommodation near campus. Meals: ¥15-40 at campus canteens. Monthly budget: ¥3,000-6,000.',
    essential_apps: [
      { name: 'WeChat (微信)', description: 'Essential for messaging, payments, and daily life. Set up WeChat Pay immediately.' },
      { name: 'Alipay (支付宝)', description: 'Mobile payment app used everywhere — stores, restaurants, taxis.' },
      { name: 'DiDi (滴滴)', description: 'Ride-hailing app, like Uber. Available in English.' },
      { name: 'Baidu Maps (百度地图)', description: 'Navigation app — far more accurate than Google Maps in China.' },
      { name: 'Meituan (美团)', description: 'Food delivery, restaurant bookings, and local services.' },
      { name: 'Taobao (淘宝)', description: 'Online shopping — everything you need delivered to your door.' },
    ],
    accommodation_info: 'Most universities offer on-campus dormitories for international students (¥800-1,500/month). Off-campus apartments available near Wudaokou and Zhongguancun areas.',
    transportation: 'Excellent subway system (22 lines). Bus network extensive. DiDi for taxis. Shared bikes (Meituan Bike, Hello Bike) everywhere. Student transit card recommended.',
    image_url: '',
  },
  {
    city_name: 'Shanghai',
    province: 'Shanghai Municipality',
    description: 'China\'s largest city and financial hub. Home to Fudan University and SJTU. A cosmopolitan metropolis blending Eastern and Western culture with stunning skyline.',
    population: '24.9 million',
    climate: 'Subtropical. Mild winters (2°C to 10°C), hot and humid summers (28°C to 38°C). Rainy season in June-July (plum rain season).',
    cost_of_living: 'High. Rent: ¥3,000-6,000/month near campus. Meals: ¥20-50 at local restaurants. Monthly budget: ¥4,000-8,000.',
    essential_apps: [
      { name: 'WeChat (微信)', description: 'Messaging, payments, mini-programs for everything.' },
      { name: 'Alipay (支付宝)', description: 'Mobile payments accepted everywhere.' },
      { name: 'Metro大都会', description: 'Shanghai metro QR code for subway entry — faster than buying tickets.' },
      { name: 'DiDi (滴滴)', description: 'Ride-hailing with English interface.' },
      { name: 'Eleme (饿了么)', description: 'Food delivery app, popular in Shanghai.' },
      { name: 'Xianyu (闲鱼)', description: 'Second-hand marketplace — great for furniture and electronics.' },
    ],
    accommodation_info: 'University dorms: ¥1,000-2,000/month. Popular student areas: Wujiaochang (Fudan area), Minhang (SJTU area). Shared apartments: ¥2,500-4,500/month.',
    transportation: 'World-class metro system (19 lines, 500+ stations). Maglev train to airport. Extensive bus network. Shared bikes popular.',
    image_url: '',
  },
  {
    city_name: 'Hangzhou',
    province: 'Zhejiang',
    description: 'Known as "Paradise on Earth," home to Zhejiang University. Beautiful West Lake, thriving tech industry (Alibaba HQ), and excellent quality of life for students.',
    population: '12.2 million',
    climate: 'Subtropical monsoon. Warm springs, hot summers, pleasant autumns, mild winters. Summer: 30-38°C, Winter: 2-10°C. Beautiful in spring and autumn.',
    cost_of_living: 'Moderate. Rent: ¥2,000-3,500/month. Meals: ¥12-30 at campus canteens. Monthly budget: ¥2,500-5,000.',
    essential_apps: [
      { name: 'WeChat (微信)', description: 'Essential for all communication and payments.' },
      { name: 'Alipay (支付宝)', description: 'Alibaba is headquartered here — Alipay works seamlessly everywhere.' },
      { name: 'Hangzhou Metro', description: 'QR code for metro access.' },
      { name: 'DiDi (滴滴)', description: 'Ride-hailing app.' },
      { name: 'Hello Bike (哈啰单车)', description: 'Very popular shared bikes— perfect for Hangzhou\'s flat terrain.' },
    ],
    accommodation_info: 'Zhejiang University offers international student dorms at ¥600-1,200/month. Off-campus: Xihu District and near campus areas. Very student-friendly city.',
    transportation: 'Growing metro system (5 lines). Public bikes very popular around West Lake. Buses cover the entire city. DiDi widely available.',
    image_url: '',
  },
  {
    city_name: 'Nanchang',
    province: 'Jiangxi',
    description: 'Capital of Jiangxi Province, a rapidly developing city with several good universities. Known for its revolutionary history and Tengwang Pavilion. Affordable living for students.',
    population: '6.3 million',
    climate: 'Subtropical humid. Hot summers (30-38°C), mild winters (3-8°C). Known for being quite hot in summer. Best seasons: Spring and Autumn.',
    cost_of_living: 'Very affordable. Rent: ¥800-2,000/month. Meals: ¥8-20 at local restaurants. Monthly budget: ¥1,500-3,000. One of the most affordable cities for students.',
    essential_apps: [
      { name: 'WeChat (微信)', description: 'Essential communication and payment app.' },
      { name: 'Alipay (支付宝)', description: 'Mobile payments for daily transactions.' },
      { name: 'DiDi (滴滴)', description: 'Ride-hailing — taxis are also very affordable here.' },
      { name: 'Meituan (美团)', description: 'Food delivery and local restaurant deals.' },
    ],
    accommodation_info: 'University dorms are very affordable at ¥400-800/month. Off-campus apartments in student areas cost ¥600-1,500/month. Very budget-friendly city.',
    transportation: 'Metro system (4 lines, expanding). Buses are the main public transport. Taxis and DiDi very affordable. Shared bikes available.',
    image_url: '',
  },
  {
    city_name: 'Guangzhou',
    province: 'Guangdong',
    description: 'Major southern city and trading hub, home to Sun Yat-sen University. Known for Cantonese cuisine, vibrant culture, and proximity to Hong Kong and Shenzhen.',
    population: '18.7 million',
    climate: 'Subtropical. Warm and humid year-round. Mild winters (10-20°C), hot summers (28-35°C). Typhoon season: July-September. High humidity.',
    cost_of_living: 'Moderate. Rent: ¥2,000-4,000/month. Meals: ¥15-35. Monthly budget: ¥3,000-5,500. Great street food keeps food costs low.',
    essential_apps: [
      { name: 'WeChat (微信)', description: 'Communication, payments, and lifestyle platform.' },
      { name: 'Alipay (支付宝)', description: 'Widely used for payments.' },
      { name: 'Guangzhou Metro', description: 'QR code for one of China\'s best metro systems.' },
      { name: 'DiDi (滴滴)', description: 'Ride-hailing app.' },
      { name: 'Meituan (美团)', description: 'Food delivery — essential for trying Guangzhou\'s incredible food scene.' },
    ],
    accommodation_info: 'Sun Yat-sen University dorms: ¥800-1,500/month. Off-campus in Haizhu or Tianhe districts: ¥2,000-3,500/month. Easy to find shared apartments.',
    transportation: 'Excellent metro system (16 lines). Comprehensive bus network. BRT (Bus Rapid Transit). High-speed rail connections to Shenzhen (30 min) and Hong Kong (48 min).',
    image_url: '',
  },
  {
    city_name: 'Wuhan',
    province: 'Hubei',
    description: 'Major central China city at the confluence of the Yangtze and Han rivers. Home to Wuhan University (famous for cherry blossoms) and HUST. Large student population.',
    population: '12.3 million',
    climate: 'Subtropical monsoon. Hot summers — one of China\'s "four furnaces" (35-40°C). Cold, damp winters (0-5°C). Spring cherry blossom season is spectacular.',
    cost_of_living: 'Affordable. Rent: ¥1,500-3,000/month. Meals: ¥10-25. Monthly budget: ¥2,000-4,000. Famous for cheap and delicious street food (hot dry noodles!).',
    essential_apps: [
      { name: 'WeChat (微信)', description: 'Essential for everything.' },
      { name: 'Alipay (支付宝)', description: 'Mobile payments.' },
      { name: 'Wuhan Metro', description: 'QR code for metro access.' },
      { name: 'DiDi (滴滴)', description: 'Ride-hailing.' },
      { name: 'Meituan (美团)', description: 'Food delivery and local services.' },
    ],
    accommodation_info: 'Wuhan University and HUST offer international student dorms at ¥500-1,200/month. Optics Valley (光谷) and Wuchang are popular student neighborhoods.',
    transportation: 'Metro system (12 lines, one of the longest in China). Extensive bus network. Ferries across the Yangtze. DiDi widely available.',
    image_url: '',
  },
];
