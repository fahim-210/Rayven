export interface GeoDivision {
  name: string;
  districts: {
    name: string;
    thanas: string[];
  }[];
}

export const BANGLADESH_DIVISIONS: GeoDivision[] = [
  {
    name: 'Dhaka',
    districts: [
      {
        name: 'Dhaka',
        thanas: [
          'Dhanmondi',
          'Gulshan',
          'Banani',
          'Uttara',
          'Mirpur',
          'Mohammadpur',
          'Badda',
          'Motijheel',
          'Khilgaon',
          'Tejgaon',
          'Rampura',
          'Bashundhara R/A',
          'Lalbagh',
          'Paltan',
        ],
      },
      {
        name: 'Gazipur',
        thanas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kapasia', 'Sreepur'],
      },
      {
        name: 'Narayanganj',
        thanas: ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Sonargaon', 'Araihazar'],
      },
    ],
  },
  {
    name: 'Chattogram',
    districts: [
      {
        name: 'Chattogram',
        thanas: ['Agrabad', 'Panchlaish', 'Kotwali', 'Halishahar', 'Khulshi', 'Nasirabad', 'Chandgaon'],
      },
      {
        name: "Cox's Bazar",
        thanas: ["Cox's Bazar Sadar", 'Teknaf', 'Ramu', 'Chakaria', 'Ukhia'],
      },
      {
        name: 'Cumilla',
        thanas: ['Cumilla Adarsha Sadar', 'Daudkandi', 'Chandina', 'Laksam'],
      },
    ],
  },
  {
    name: 'Rajshahi',
    districts: [
      {
        name: 'Rajshahi',
        thanas: ['Boalia', 'Rajpara', 'Motihar', 'Shah Makhdum', 'Paba', 'Godagari'],
      },
      {
        name: 'Bogura',
        thanas: ['Bogura Sadar', 'Sherpur', 'Shibganj', 'Gabtali'],
      },
    ],
  },
  {
    name: 'Khulna',
    districts: [
      {
        name: 'Khulna',
        thanas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Rupsha'],
      },
      {
        name: 'Jashore',
        thanas: ['Jashore Sadar', 'Jhikargachha', 'Bagherpara', 'Abhaynagar'],
      },
    ],
  },
  {
    name: 'Sylhet',
    districts: [
      {
        name: 'Sylhet',
        thanas: ['Sylhet Sadar', 'Beanibazar', 'Golapganj', 'Biswanath', 'Zakiganj'],
      },
    ],
  },
  {
    name: 'Barishal',
    districts: [
      {
        name: 'Barishal',
        thanas: ['Barishal Sadar', 'Babuganj', 'Bakerganj', 'Gournadi', 'Uzirpur'],
      },
    ],
  },
  {
    name: 'Rangpur',
    districts: [
      {
        name: 'Rangpur',
        thanas: ['Rangpur Sadar', 'Pirgachha', 'Badarganj', 'Mithapukur'],
      },
    ],
  },
  {
    name: 'Mymensingh',
    districts: [
      {
        name: 'Mymensingh',
        thanas: ['Mymensingh Sadar', 'Muktagachha', 'Trishal', 'Bhaluka', 'Gafargaon'],
      },
    ],
  },
];

export const BANGLADESH_GEO_HIERARCHY: Record<string, { districts: { name: string; thanas: string[] }[] }> =
  BANGLADESH_DIVISIONS.reduce((acc, curr) => {
    acc[curr.name] = { districts: curr.districts };
    return acc;
  }, {} as Record<string, { districts: { name: string; thanas: string[] }[] }>);

export const BANGLADESH_DIVISION_NAMES: string[] = BANGLADESH_DIVISIONS.map((d) => d.name);

export function getDeliveryChargeForDivision(divisionName?: string): number {
  if (!divisionName) return 120;
  if (divisionName.toLowerCase() === 'dhaka') {
    return 70; // Inside Dhaka delivery charge ৳70
  }
  return 120; // Outside Dhaka delivery charge ৳120
}
