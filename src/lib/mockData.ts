import { ExploreCategory, FeedPost, GapReport, Supplier, UserProfile } from '../types';

export const mockPosts: FeedPost[] = [
  {
    id: 'mock-post-1',
    authorName: 'Wanjiru K.',
    authorAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhaslFb-4iZgN108C0BJhJ9AoC37XdXneB7bGLzd1bqnmyuuwXl5Rr2ChLIIEApXRDxAMJlcSKPYhO9mbyqbAWyMsOLWRlt5m5OaDszGHgedsPD2LidUeChZRif7J3thxeZEZGUW_M7nceGs4omRvagdfGwPQ1AvU4bOQio24Gk2y6Sl4BKAKpoKUXbgaVer59SXhELBJr9cuyeaQWyv1evR1Iu6Dl1Y9WXgslOtyyrSsYfqxI1-5F',
    isVerified: true,
    isMentor: true,
    timeAgo: '2h ago',
    category: 'Supply Chain',
    title: 'Where to source quality mtumba bales in Gikomba (2025 prices)',
    body: "Navigating Gikomba can be overwhelming for new traders. I've compiled an updated list of the most reliable suppliers for grade A bales, including current market rates and negotiation tactics...",
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbofzpPuMtTMM7WrKM83Hev0X32XUzSdm0vtT68Yj7KG5uNbQ8aHghIaghaBgAjQrxHwhOwH1MjgWKCSS3vrs8tl4Qk4Hg7mtEPI0OXWcxIOzIt5GSCnoQmgrA_CSrkNQ3tRtzpqC6fxdZfIG8QoG-SYHE_oJVJ3HTYCXQTewma_Gu6CPVbfPD4rdzFwwLRLxK9u5nYPpWEndquC10sqko7s4ipkvTdAOwFJoEEm3Zu2ZOUve265hD',
    likes: 245,
    comments: 42,
  },
];

export const mockCategories: ExploreCategory[] = [
  {
    id: 'mock-mitumba',
    icon: 'shopping-bag',
    iconColor: '#fff',
    iconBg: 'rgba(255,255,255,0.2)',
    label: 'Mitumba',
    labelColor: '#fff',
    labelBorder: 'rgba(255,255,255,0.1)',
    title: 'Second-hand Apparel',
    members: '12,450 Members',
    badge: 'Top in Nairobi',
    height: 320,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDx5VpI7cL84OEtzCB2bjLpbuSW1eI_LAv-axAJngMH0A2SEEkcpaFv02cDEV3qITlaww6xjBc0shdzUwSE3JKpY8-Jw1qtosErAEBvuKE7KmIqAJqXY6mtLJSF7PcYNsXAEHB_pJnuq7g1Gaa9wKYKjlDCsEkXTi33x4LRJ1pjPg9IwAzHwDyNgINBzcfInlMkTt9CAMx6XovGRlTZzOwar-2uoxem6kjIipb35zakh3BS97f7IL34',
    dark: true,
  },
  {
    id: 'mock-kinyozi',
    icon: 'scissors',
    iconColor: '#624000',
    iconBg: '#ffddb1',
    label: 'Kinyozi',
    labelColor: '#44474e',
    labelBorder: 'transparent',
    title: 'Kinyozi',
    subtitle: 'Barbers & Salons',
    members: '5,120 Members',
    height: 210,
    simple: true,
  },
  {
    id: 'mock-duka',
    icon: 'building-storefront',
    iconColor: '#005233',
    iconBg: '#4a8470',
    label: 'Duka',
    labelColor: '#44474e',
    labelBorder: 'transparent',
    title: 'Duka',
    subtitle: 'Retail Kiosks',
    members: '22,000 Members',
    height: 210,
    simple: true,
  },
  {
    id: 'mock-electronics',
    icon: 'device-phone-mobile',
    iconColor: '#001533',
    iconBg: 'rgba(251,249,244,0.8)',
    label: 'Electronics',
    labelColor: '#1b1c19',
    labelBorder: 'rgba(116,119,127,0.2)',
    title: 'Gadgets & Repairs',
    members: '8,200 Members',
    badge: 'Top in Mombasa',
    height: 200,
  },
  {
    id: 'mock-hardware',
    icon: 'wrench-screwdriver',
    iconColor: '#d6e3ff',
    iconBg: 'rgba(255,255,255,0.1)',
    label: 'Hardware',
    labelColor: '#d6e3ff',
    labelBorder: 'rgba(255,255,255,0.2)',
    title: 'Construction Supply',
    members: '4,300 Members',
    badge: 'Top in Kiambu',
    height: 200,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDLeh0uuK1glzWY0fgaGv4Jc-FfaPcD2pz6Ad0FmfRqNN_RMp8-mUgmOUMf6gNywXtTRlEGFL7naeygX5jI3hojt0bNnmfNJbpwyd7PSZmEX7_gUAfKzH6qTSfDUrkAzWzNXlPPHj1WqF5HmZLxo-Fap1sUbxcsahKFXiqf7alyIzTbgvR_EDJmoEr1wPR1jEqJ75JU3Xuea0D7Zby3aSrc7gKPnbEJMFo4cmsR-pitHoWPVm0JW1pZ',
    dark: true,
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'mock-supplier-1',
    name: 'Nairobi Weavers Coop',
    category: 'Textiles',
    rating: '4.9',
    verifiedDate: "Mar '23",
    description:
      'Specialized in high-durability uniform fabrics and commercial linens. Capacity for bulk institutional orders.',
    price: 'Ksh 800 - 2k / unit',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbylvmIgrztB8Th16eWZ0ZE7zIZ_2ia23I-WT4ZKXJu0NMPmJ_nxAMBx2w_logFDv2i9mfHwsyFRZ-vgkm3sqehtkqhZaQkB6JP-9YLHd8Px1e95U4AcRAYPKGVc9q88TlMtHfi3VMka6vkFW7cTWDuJCfAijDPHIaWpROiu25CcwUdPnPZ_seksGa7o2abS0k96teYNFUwT1WESc__NkgL9et9_GSYVBGHVrtNltkMQvRgLCXZqZh',
    location: 'Nairobi',
  },
  {
    id: 'mock-supplier-2',
    name: 'Kigali Smart Systems',
    category: 'Tech Hardware',
    rating: '4.7',
    verifiedDate: "Jan '24",
    description:
      'Assembling point-of-sale IoT devices and customized business hardware solutions for retail chains.',
    price: 'Ksh 15k - 40k / unit',
    location: 'Nairobi',
  },
  {
    id: 'mock-supplier-3',
    name: 'Zanzibar Spices & Preserves',
    category: 'FMCG Food',
    isNew: true,
    verifiedDate: "Aug '24",
    description: 'Export-grade spice blends and fruit preserves. KEBS certified production facility.',
    price: 'Ksh 250 - 1.2k / unit',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAcv7SHZPcotksaaWgSG1Qk3-KULvTUTdM948dK8oWkM-HmrDjndWXHI-wtjZHZd5mAWxtKjAG7t4HgoRiIIidWwnM_rTvsUed4RPkFP2_9NslL2oe82jcvjQF4GpDG7GPFO46d8401GwJExmDbmT0arFQ5p5oaTSIdUFCUGZ3YJywWqFdO04Z8Qs1IOUXNP9fS-q-rJxIT4CgpDxCyWVhG2wI4ZIiU72i1yBSyWT8igzEzP5hu-7Yj',
    location: 'Mombasa',
  },
];

export const mockFeaturedSupplier: Supplier = {
  id: 'mock-supplier-featured',
  name: 'Rift Valley Agro-Processors Ltd',
  category: 'Agriculture',
  rating: '4.8',
  verifiedDate: 'Oct 2022',
  description:
    'Premium processors of organic grains and legumes. High-capacity facility supporting regional supply chains with international quality standards.',
  price: 'Ksh 45k - 120k / order',
  featured: true,
  location: 'Nakuru County',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCI7dMwVaOBTvmLspze81mWeplkxip9galeESXzX3Ae7ktFyg8UgW-CNX8ssiQ5eIcW9RLyc6MNIcKcpb0cFf591WYgB9W0v1ewvDOlHuQA-6oZjKWlG2hNdutFTbun34AKuerrVBEyq_AmjJvzYmyv93fNcHwB45Lgb8PQTs7ywIPJupCkxJQlo4ALyMdDCKFHxlIbZ54dR6VkM7IfyjilGCR9IzR68QP6NS1i7IsE8Kt3jDimAoSF',
};

export const mockGapReports: GapReport[] = [
  {
    id: 'mock-report-1',
    tag: 'Demographics',
    icon: 'chart-bar',
    title: 'Target Audience Spending Power',
    description:
      'Detailed breakdown of disposable income for electronics within a 5km radius of central Kayole, Nairobi.',
    reportType: 'demographics',
    isUnlocked: false,
    price: 500,
    location: 'Kayole, Nairobi',
  },
  {
    id: 'mock-report-2',
    tag: 'Competitor Map',
    icon: 'building-storefront',
    title: 'Existing Supplier Footprint',
    description:
      'Geospatial mapping of current electronic shops, their estimated sizes, and operational hours.',
    reportType: 'competitor',
    previewImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCohyOJtyaJQYw537wjNZP8HALKtBj6Ag6sFZwSsQ4OD_jaOTNnNREqCXNIfGCo8k6aqDd-zLjikMANj8WokbAqn0gelRtZNNvg-d8MwFgaIMxuSIyLYaLW5b4KCCID7AT_FIuvAUo6YjS5zi48Nn6AdBBxsjS87sMmjpX3XwmnqdwmNlhDtvktayJHzl-C_FF1CL8zFruMonL7_wEi1j1NzPtj2n8AqIyMW8afLgSAY8s9chr6FHXM',
    isUnlocked: false,
    price: 500,
    location: 'Kayole, Nairobi',
  },
];

export const mockProfile: UserProfile = {
  id: 'mock-profile',
  fullName: 'David Kamau',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBHMZlmgNwkKnyXjsaFn2pCT6ngjnZYGurr6hj7k2qrpHsB-EyX1R3wkhaeiHgacM0o8SDxxme73WDFcR862ySNcsOrd1MXj7rNgM5I0YXCwhY_eaHPRx7q2G2ZD7IABxLqUOlheVKuHf7TN-kkKx7hF7nTDt8lwve863kJQjUb_4aq38q59eb-b5UVdVt9rsntIArwp-2XJxuNxtWatpznA-l2T2FaO5uj-QF-EvZ0PIY-zvNvd1yR',
  businessType: 'Electronics Retailer',
  location: 'Kayole, Nairobi',
  tierName: 'Tier 1: Verified Trader',
  communityPosts: 24,
  helpfulUpvotes: 142,
  walletBalance: 12400,
  upvotedVerified: true,
  email: '+254 712 *** 890',
};