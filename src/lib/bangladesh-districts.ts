/**
 * Bangladesh administrative geography for the hero location picker.
 *
 * ────────────────────────────────────────────────────────────────────
 * Two-level model:
 *   District  → e.g. "Gazipur"       (64 divisions of the country)
 *     Upazila → e.g. "Gazipur Sadar"  (sub-district under a district)
 *
 * Slugs match what the backend expects for `filter[city]=`. The `ads`
 * counts are static placeholders here — a follow-up ticket can hydrate
 * them from `/api/v1/ads/counts?group=district` so the picker mirrors
 * Bikroy's live numbers.
 * ────────────────────────────────────────────────────────────────────
 */

export type Upazila = {
  name: string;
  slug: string;
  ads: number;
};

export type District = {
  name: string;
  slug: string;
  ads: number;
  upazilas: Upazila[];
};

/** Small helper so upazila objects stay compact and readable below. */
const u = (name: string, slug: string, ads = 0): Upazila => ({ name, slug, ads });

export const BANGLADESH_DISTRICTS: District[] = [
  { name: 'Bagerhat',        slug: 'bagerhat',        ads: 1224, upazilas: [
    u('Bagerhat Sadar', 'bagerhat-sadar', 320),
    u('Chitalmari',     'chitalmari',     140),
    u('Fakirhat',       'fakirhat',       112),
    u('Mongla',         'mongla',         256),
    u('Morrelganj',     'morrelganj',     198),
    u('Sarankhola',     'sarankhola',      80),
  ]},
  { name: 'Bandarban',       slug: 'bandarban',       ads: 75,   upazilas: [
    u('Bandarban Sadar', 'bandarban-sadar', 45),
    u('Ruma',            'ruma',            10),
    u('Thanchi',         'thanchi',          8),
  ]},
  { name: 'Barguna',         slug: 'barguna',         ads: 481,  upazilas: [
    u('Barguna Sadar', 'barguna-sadar', 210),
    u('Amtali',        'amtali',        102),
    u('Patharghata',   'patharghata',    88),
  ]},
  { name: 'Barishal',        slug: 'barishal',        ads: 8859, upazilas: [
    u('Barishal Sadar', 'barishal-sadar', 4500),
    u('Babuganj',       'babuganj',        520),
    u('Bakerganj',      'bakerganj',       780),
    u('Banaripara',     'banaripara',      430),
    u('Gaurnadi',       'gaurnadi',        910),
    u('Hizla',          'hizla',           260),
    u('Mehendiganj',    'mehendiganj',     490),
    u('Muladi',         'muladi',          380),
  ]},
  { name: 'Bhola',           slug: 'bhola',           ads: 1047, upazilas: [
    u('Bhola Sadar', 'bhola-sadar', 520),
    u('Char Fasson', 'char-fasson', 210),
    u('Lalmohan',    'lalmohan',    170),
  ]},
  { name: 'Bogura',          slug: 'bogura',          ads: 2950, upazilas: [
    u('Bogura Sadar', 'bogura-sadar', 1400),
    u('Sherpur',      'sherpur',       620),
    u('Shibganj',     'shibganj',      430),
    u('Sonatola',     'sonatola',      190),
  ]},
  { name: 'Brahmanbaria',    slug: 'brahmanbaria',    ads: 807,  upazilas: [
    u('Brahmanbaria Sadar', 'brahmanbaria-sadar', 380),
    u('Akhaura',            'akhaura',            140),
    u('Kasba',              'kasba',              120),
  ]},
  { name: 'Chandpur',        slug: 'chandpur',        ads: 1229, upazilas: [
    u('Chandpur Sadar', 'chandpur-sadar', 610),
    u('Faridganj',      'faridganj',      210),
    u('Hajiganj',       'hajiganj',       180),
  ]},
  { name: 'Chapainawabganj', slug: 'chapainawabganj', ads: 367,  upazilas: [
    u('Chapainawabganj Sadar', 'chapainawabganj-sadar', 180),
    u('Shibganj',              'shibganj-cnj',           95),
    u('Nachole',               'nachole',                42),
  ]},
  { name: 'Chattogram',      slug: 'chattogram',      ads: 20474, upazilas: [
    u('Chattogram Sadar', 'chattogram-sadar', 8600),
    u('Anwara',           'anwara',            520),
    u('Boalkhali',        'boalkhali',         470),
    u('Fatikchhari',      'fatikchhari',       610),
    u('Hathazari',        'hathazari',        1200),
    u('Mirsharai',        'mirsharai',         540),
    u('Patiya',           'patiya',           1100),
    u('Rangunia',         'rangunia',          420),
    u('Sitakunda',        'sitakunda',         980),
  ]},
  { name: 'Chuadanga',       slug: 'chuadanga',       ads: 744,  upazilas: [
    u('Chuadanga Sadar', 'chuadanga-sadar', 380),
    u('Alamdanga',       'alamdanga',       180),
    u('Damurhuda',       'damurhuda',       110),
  ]},
  { name: 'Cox\'s Bazar',    slug: 'coxs-bazar',      ads: 862,  upazilas: [
    u('Cox\'s Bazar Sadar', 'coxs-bazar-sadar', 480),
    u('Chakaria',           'chakaria',         180),
    u('Teknaf',             'teknaf',           110),
  ]},
  { name: 'Cumilla',         slug: 'cumilla',         ads: 2100, upazilas: [
    u('Cumilla Sadar', 'cumilla-sadar', 1150),
    u('Chandina',      'chandina',       230),
    u('Debidwar',      'debidwar',       170),
    u('Laksam',        'laksam',         210),
  ]},
  { name: 'Dhaka',           slug: 'dhaka',           ads: 151241, upazilas: [
    u('Dhanmondi',   'dhanmondi',   9800),
    u('Gulshan',     'gulshan',    12400),
    u('Mirpur',      'mirpur',     18700),
    u('Mohammadpur', 'mohammadpur',10500),
    u('Uttara',      'uttara',     14300),
    u('Banani',      'banani',      6100),
    u('Bashundhara', 'bashundhara', 5200),
    u('Old Dhaka',   'old-dhaka',   8400),
    u('Tejgaon',     'tejgaon',     7300),
    u('Motijheel',   'motijheel',   4500),
  ]},
  { name: 'Dinajpur',        slug: 'dinajpur',        ads: 1550, upazilas: [
    u('Dinajpur Sadar', 'dinajpur-sadar', 780),
    u('Birganj',        'birganj',        170),
    u('Parbatipur',     'parbatipur',     220),
  ]},
  { name: 'Faridpur',        slug: 'faridpur',        ads: 1120, upazilas: [
    u('Faridpur Sadar', 'faridpur-sadar', 620),
    u('Bhanga',         'bhanga',         190),
    u('Boalmari',       'boalmari',       140),
  ]},
  { name: 'Feni',            slug: 'feni',            ads: 830,  upazilas: [
    u('Feni Sadar', 'feni-sadar', 480),
    u('Sonagazi',   'sonagazi',   140),
    u('Parshuram',  'parshuram',   80),
  ]},
  { name: 'Gaibandha',       slug: 'gaibandha',       ads: 690,  upazilas: [
    u('Gaibandha Sadar', 'gaibandha-sadar', 320),
    u('Palashbari',      'palashbari',      140),
    u('Sadullapur',      'sadullapur',      110),
  ]},
  { name: 'Gazipur',         slug: 'gazipur',         ads: 9374, upazilas: [
    u('Gazipur Sadar', 'gazipur-sadar', 4649),
    u('Kaliakair',     'kaliakair',      712),
    u('Kaliganj',      'kaliganj',       125),
    u('Kapasia',       'kapasia',        127),
    u('Sreepur',       'sreepur',        547),
  ]},
  { name: 'Gopalganj',       slug: 'gopalganj',       ads: 540,  upazilas: [
    u('Gopalganj Sadar', 'gopalganj-sadar', 260),
    u('Kotalipara',      'kotalipara',      120),
    u('Muksudpur',       'muksudpur',        95),
  ]},
  { name: 'Habiganj',        slug: 'habiganj',        ads: 680,  upazilas: [
    u('Habiganj Sadar', 'habiganj-sadar', 320),
    u('Madhabpur',      'madhabpur',      140),
    u('Bahubal',        'bahubal',         90),
  ]},
  { name: 'Jamalpur',        slug: 'jamalpur',        ads: 890,  upazilas: [
    u('Jamalpur Sadar', 'jamalpur-sadar', 420),
    u('Sarishabari',    'sarishabari',    160),
    u('Islampur',       'islampur',       140),
  ]},
  { name: 'Jashore',         slug: 'jashore',         ads: 2404, upazilas: [
    u('Jashore Sadar', 'jashore-sadar', 1200),
    u('Abhaynagar',    'abhaynagar',     260),
    u('Bagherpara',    'bagherpara',     190),
    u('Chaugachha',    'chaugachha',     170),
  ]},
  { name: 'Jhalokati',       slug: 'jhalokati',       ads: 357,  upazilas: [
    u('Jhalokati Sadar', 'jhalokati-sadar', 180),
    u('Nalchity',        'nalchity',         90),
    u('Rajapur',         'rajapur',          60),
  ]},
  { name: 'Jhenaidah',       slug: 'jhenaidah',       ads: 1939, upazilas: [
    u('Jhenaidah Sadar', 'jhenaidah-sadar', 980),
    u('Kaliganj',        'kaliganj-jhe',    260),
    u('Kotchandpur',     'kotchandpur',     140),
  ]},
  { name: 'Joypurhat',       slug: 'joypurhat',       ads: 329,  upazilas: [
    u('Joypurhat Sadar', 'joypurhat-sadar', 170),
    u('Akkelpur',        'akkelpur',         80),
    u('Kalai',           'kalai',            50),
  ]},
  { name: 'Khagrachhari',    slug: 'khagrachhari',    ads: 99,   upazilas: [
    u('Khagrachhari Sadar', 'khagrachhari-sadar', 60),
    u('Dighinala',          'dighinala',          20),
    u('Panchhari',          'panchhari',          10),
  ]},
  { name: 'Khulna',          slug: 'khulna',          ads: 14193, upazilas: [
    u('Khulna Sadar', 'khulna-sadar', 7200),
    u('Batiaghata',   'batiaghata',    480),
    u('Dumuria',      'dumuria',       620),
    u('Rupsa',        'rupsa',        1900),
    u('Terokhada',    'terokhada',     180),
  ]},
  { name: 'Kishoreganj',     slug: 'kishoreganj',     ads: 1548, upazilas: [
    u('Kishoreganj Sadar', 'kishoreganj-sadar', 780),
    u('Bajitpur',          'bajitpur',          210),
    u('Katiadi',           'katiadi',           150),
  ]},
  { name: 'Kurigram',        slug: 'kurigram',        ads: 948,  upazilas: [
    u('Kurigram Sadar', 'kurigram-sadar', 480),
    u('Nageshwari',     'nageshwari',     180),
    u('Ulipur',         'ulipur',         140),
  ]},
  { name: 'Kushtia',         slug: 'kushtia',         ads: 4040, upazilas: [
    u('Kushtia Sadar', 'kushtia-sadar', 2100),
    u('Bheramara',     'bheramara',      430),
    u('Kumarkhali',    'kumarkhali',     560),
    u('Mirpur',        'mirpur-kus',     380),
  ]},
  { name: 'Lakshmipur',      slug: 'lakshmipur',      ads: 766,  upazilas: [
    u('Lakshmipur Sadar', 'lakshmipur-sadar', 380),
    u('Raipur',           'raipur',           180),
    u('Ramganj',          'ramganj',          140),
  ]},
  { name: 'Lalmonirhat',     slug: 'lalmonirhat',     ads: 510,  upazilas: [
    u('Lalmonirhat Sadar', 'lalmonirhat-sadar', 260),
    u('Aditmari',          'aditmari',          110),
    u('Patgram',           'patgram',            90),
  ]},
  { name: 'Madaripur',       slug: 'madaripur',       ads: 798,  upazilas: [
    u('Madaripur Sadar', 'madaripur-sadar', 380),
    u('Kalkini',         'kalkini',         180),
    u('Shibchar',        'shibchar',        170),
  ]},
  { name: 'Magura',          slug: 'magura',          ads: 694,  upazilas: [
    u('Magura Sadar', 'magura-sadar', 340),
    u('Shalikha',     'shalikha',     140),
    u('Sreepur',      'sreepur-mag',  110),
  ]},
  { name: 'Manikganj',       slug: 'manikganj',       ads: 890,  upazilas: [
    u('Manikganj Sadar', 'manikganj-sadar', 420),
    u('Ghior',           'ghior',           160),
    u('Saturia',         'saturia',         140),
  ]},
  { name: 'Meherpur',        slug: 'meherpur',        ads: 320,  upazilas: [
    u('Meherpur Sadar', 'meherpur-sadar', 170),
    u('Gangni',         'gangni',          90),
    u('Mujibnagar',     'mujibnagar',      50),
  ]},
  { name: 'Moulvibazar',     slug: 'moulvibazar',     ads: 910,  upazilas: [
    u('Moulvibazar Sadar', 'moulvibazar-sadar', 430),
    u('Sreemangal',        'sreemangal',        260),
    u('Kulaura',           'kulaura',           140),
  ]},
  { name: 'Munshiganj',      slug: 'munshiganj',      ads: 1120, upazilas: [
    u('Munshiganj Sadar', 'munshiganj-sadar', 560),
    u('Sirajdikhan',      'sirajdikhan',      210),
    u('Sreenagar',        'sreenagar',        170),
  ]},
  { name: 'Mymensingh',      slug: 'mymensingh',      ads: 3210, upazilas: [
    u('Mymensingh Sadar', 'mymensingh-sadar', 1600),
    u('Bhaluka',          'bhaluka',           420),
    u('Trishal',          'trishal',           260),
    u('Fulbaria',         'fulbaria',          210),
  ]},
  { name: 'Naogaon',         slug: 'naogaon',         ads: 1420, upazilas: [
    u('Naogaon Sadar', 'naogaon-sadar', 720),
    u('Manda',         'manda',         230),
    u('Sapahar',       'sapahar',       160),
  ]},
  { name: 'Narail',          slug: 'narail',          ads: 480,  upazilas: [
    u('Narail Sadar', 'narail-sadar', 240),
    u('Kalia',        'kalia',        120),
    u('Lohagara',     'lohagara',      90),
  ]},
  { name: 'Narayanganj',     slug: 'narayanganj',     ads: 4780, upazilas: [
    u('Narayanganj Sadar', 'narayanganj-sadar', 2400),
    u('Bandar',            'bandar',             520),
    u('Rupganj',           'rupganj',            980),
    u('Sonargaon',         'sonargaon',          420),
  ]},
  { name: 'Narsingdi',       slug: 'narsingdi',       ads: 1120, upazilas: [
    u('Narsingdi Sadar', 'narsingdi-sadar', 560),
    u('Belabo',          'belabo',          130),
    u('Palash',          'palash',          170),
  ]},
  { name: 'Natore',          slug: 'natore',          ads: 1883, upazilas: [
    u('Natore Sadar', 'natore-sadar', 940),
    u('Bagatipara',   'bagatipara',   180),
    u('Lalpur',       'lalpur',       210),
  ]},
  { name: 'Netrokona',       slug: 'netrokona',       ads: 531,  upazilas: [
    u('Netrokona Sadar', 'netrokona-sadar', 260),
    u('Barhatta',        'barhatta',        110),
    u('Durgapur',        'durgapur',         80),
  ]},
  { name: 'Nilphamari',      slug: 'nilphamari',      ads: 1202, upazilas: [
    u('Nilphamari Sadar', 'nilphamari-sadar', 620),
    u('Saidpur',          'saidpur',          320),
    u('Jaldhaka',         'jaldhaka',         140),
  ]},
  { name: 'Noakhali',        slug: 'noakhali',        ads: 1317, upazilas: [
    u('Noakhali Sadar', 'noakhali-sadar', 660),
    u('Begumganj',      'begumganj',      210),
    u('Chatkhil',       'chatkhil',       130),
    u('Senbagh',        'senbagh',        110),
  ]},
  { name: 'Pabna',           slug: 'pabna',           ads: 3504, upazilas: [
    u('Pabna Sadar', 'pabna-sadar', 1800),
    u('Bera',        'bera',         310),
    u('Ishwardi',    'ishwardi',     620),
    u('Sujanagar',   'sujanagar',    180),
  ]},
  { name: 'Panchagarh',      slug: 'panchagarh',      ads: 191,  upazilas: [
    u('Panchagarh Sadar', 'panchagarh-sadar', 100),
    u('Boda',             'boda',              50),
    u('Debiganj',         'debiganj',          25),
  ]},
  { name: 'Patuakhali',      slug: 'patuakhali',      ads: 772,  upazilas: [
    u('Patuakhali Sadar', 'patuakhali-sadar', 380),
    u('Bauphal',          'bauphal',          160),
    u('Galachipa',        'galachipa',        130),
  ]},
  { name: 'Pirojpur',        slug: 'pirojpur',        ads: 442,  upazilas: [
    u('Pirojpur Sadar', 'pirojpur-sadar', 220),
    u('Bhandaria',      'bhandaria',      100),
    u('Nazirpur',       'nazirpur',        70),
  ]},
  { name: 'Rajbari',         slug: 'rajbari',         ads: 869,  upazilas: [
    u('Rajbari Sadar', 'rajbari-sadar', 430),
    u('Goalanda',      'goalanda',      180),
    u('Pangsha',       'pangsha',       130),
  ]},
  { name: 'Rajshahi',        slug: 'rajshahi',        ads: 8847, upazilas: [
    u('Rajshahi Sadar', 'rajshahi-sadar', 4400),
    u('Bagha',          'bagha',           320),
    u('Charghat',       'charghat',        290),
    u('Godagari',       'godagari',        480),
    u('Paba',           'paba',            920),
    u('Puthia',         'puthia',          340),
  ]},
  { name: 'Rangamati',       slug: 'rangamati',       ads: 84,   upazilas: [
    u('Rangamati Sadar', 'rangamati-sadar', 50),
    u('Kaptai',          'kaptai',          20),
    u('Baghaichhari',    'baghaichhari',    10),
  ]},
  { name: 'Rangpur',         slug: 'rangpur',         ads: 6413, upazilas: [
    u('Rangpur Sadar', 'rangpur-sadar', 3200),
    u('Badarganj',     'badarganj',      420),
    u('Kaunia',        'kaunia',         310),
    u('Mithapukur',    'mithapukur',     480),
    u('Pirgachha',     'pirgachha',      260),
    u('Pirganj',       'pirganj',        380),
  ]},
  { name: 'Satkhira',        slug: 'satkhira',        ads: 1141, upazilas: [
    u('Satkhira Sadar', 'satkhira-sadar', 560),
    u('Debhata',        'debhata',        160),
    u('Kaliganj',       'kaliganj-sat',   180),
    u('Tala',           'tala',           140),
  ]},
  { name: 'Shariatpur',      slug: 'shariatpur',      ads: 690,  upazilas: [
    u('Shariatpur Sadar', 'shariatpur-sadar', 340),
    u('Bhedarganj',       'bhedarganj',       140),
    u('Damudya',          'damudya',           90),
  ]},
  { name: 'Sherpur',         slug: 'sherpur-dist',    ads: 620,  upazilas: [
    u('Sherpur Sadar', 'sherpur-sadar-dist', 310),
    u('Jhenaigati',    'jhenaigati',         140),
    u('Nakla',         'nakla',              100),
  ]},
  { name: 'Sirajganj',       slug: 'sirajganj',       ads: 1820, upazilas: [
    u('Sirajganj Sadar', 'sirajganj-sadar', 900),
    u('Belkuchi',        'belkuchi',        260),
    u('Kazipur',         'kazipur',         160),
    u('Shahjadpur',      'shahjadpur',      280),
  ]},
  { name: 'Sunamganj',       slug: 'sunamganj',       ads: 720,  upazilas: [
    u('Sunamganj Sadar', 'sunamganj-sadar', 360),
    u('Chhatak',         'chhatak',         180),
    u('Sullah',          'sullah',           60),
  ]},
  { name: 'Sylhet',          slug: 'sylhet',          ads: 6820, upazilas: [
    u('Sylhet Sadar', 'sylhet-sadar', 3400),
    u('Beanibazar',   'beanibazar',    340),
    u('Bishwanath',   'bishwanath',    220),
    u('Companiganj',  'companiganj',   180),
    u('Fenchuganj',   'fenchuganj',    160),
    u('Golapganj',    'golapganj',     420),
    u('Zakiganj',     'zakiganj',      180),
  ]},
  { name: 'Tangail',         slug: 'tangail',         ads: 2010, upazilas: [
    u('Tangail Sadar', 'tangail-sadar', 1000),
    u('Bhuapur',       'bhuapur',        140),
    u('Ghatail',       'ghatail',        260),
    u('Kalihati',      'kalihati',       210),
    u('Mirzapur',      'mirzapur',       310),
  ]},
  { name: 'Thakurgaon',      slug: 'thakurgaon',      ads: 460,  upazilas: [
    u('Thakurgaon Sadar', 'thakurgaon-sadar', 240),
    u('Baliadangi',       'baliadangi',        90),
    u('Pirganj',          'pirganj-tha',       80),
  ]},
];

/** Total ads across all districts — shown in the "All Bangladesh" row. */
export const TOTAL_ADS = BANGLADESH_DISTRICTS.reduce((s, d) => s + d.ads, 0);

/** Group districts alphabetically by first letter for the picker modal. */
export function groupDistrictsByLetter(districts: District[] = BANGLADESH_DISTRICTS) {
  const groups: Record<string, District[]> = {};
  for (const d of districts) {
    const letter = (d.name[0] ?? '#').toUpperCase();
    (groups[letter] ??= []).push(d);
  }
  return groups;
}
