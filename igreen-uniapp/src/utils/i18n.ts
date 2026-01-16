export type Language = 'en' | 'th';

export interface Translations {
  [key: string]: string | Translations;
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    queue: 'Ticket Queue',
    myWork: 'My Workspace',
    history: 'History',
    profile: 'Profile',
    settings: 'Settings',
    signOut: 'Sign Out',
    home: 'Home',
    mine: 'Mine',
    hello: 'Hello',
    online: 'Online',
    earnedToday: 'Earned Today',
    jobsCompleted: 'Jobs Completed',
    currentJob: 'Current Job',
    inProgress: 'In Progress',
    continueJob: 'Continue Job',
    noActiveJobs: 'No Active Jobs',
    freeToGrab: 'You are free to grab a new order.',
    nearbyOpportunities: 'Nearby Opportunities',
    viewAll: 'View All',
    technicianRating: 'Technician Rating',
    estTime: 'Est.',
    searchPlaceholder: 'Search work orders...',
    id: 'ID',
    issueLocation: 'Issue & Location',
    status: 'Status',
    priority: 'Priority',
    type: 'Type',
    technician: 'Technician',
    reported: 'Reported',
    grab: 'Grab',
    noTickets: 'No tickets found in this view.',
    location: 'Location',
    issueDescription: 'Issue Description',
    reportedBy: 'Reported By',
    userProfile: 'User Profile',
    language: 'Language',
    accountInfo: 'Account Information',
    appSettings: 'App Settings',
    version: 'Version',
    organization: 'Organization',
    acceptAndAssign: 'Accept & Assign to Me',
    departed: 'Departed',
    arrived: 'Arrived',
    finish: 'Finish',
    complete: 'Complete',
  },
  th: {
    dashboard: 'แดชบอร์ด',
    queue: 'คิวงาน',
    myWork: 'งานของฉัน',
    history: 'ประวัติ',
    profile: 'โปรไฟล์',
    settings: 'การตั้งค่า',
    signOut: 'ออกจากระบบ',
    home: 'หน้าหลัก',
    mine: 'งานของฉัน',
    hello: 'สวัสดี',
    online: 'ออนไลน์',
    earnedToday: 'รายได้วันนี้',
    jobsCompleted: 'งานที่เสร็จแล้ว',
    currentJob: 'งานปัจจุบัน',
    inProgress: 'กำลังดำเนินการ',
    continueJob: 'ทำงานต่อ',
    noActiveJobs: 'ไม่มีงานที่กำลังทำ',
    freeToGrab: 'คุณว่างสำหรับรับงานใหม่',
    nearbyOpportunities: 'งานใกล้เคียง',
    viewAll: 'ดูทั้งหมด',
    technicianRating: 'คะแนนช่างเทคนิค',
    estTime: 'ประมาณ',
    searchPlaceholder: 'ค้นหาใบงาน...',
    id: 'รหัส',
    issueLocation: 'ปัญหา & สถานที่',
    status: 'สถานะ',
    priority: 'ความสำคัญ',
    type: 'ประเภท',
    technician: 'ช่างเทคนิค',
    reported: 'แจ้งเมื่อ',
    grab: 'รับงาน',
    noTickets: 'ไม่พบใบงานในมุมมองนี้',
    location: 'สถานที่',
    issueDescription: 'รายละเอียดปัญหา',
    reportedBy: 'ผู้แจ้ง',
    userProfile: 'โปรไฟล์ผู้ใช้',
    language: 'ภาษา',
    accountInfo: 'ข้อมูลบัญชี',
    appSettings: 'ตั้งค่าแอป',
    version: 'เวอร์ชัน',
    organization: 'องค์กร',
    acceptAndAssign: 'รับงาน',
    departed: 'ออกเดินทาง',
    arrived: 'ถึงแล้ว',
    finish: 'เสร็จสิ้น',
    complete: 'ส่งมอบ',
  },
};

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string): string {
  const keys = key.split('.');
  let result: Record<string, string> | string = translations[currentLanguage];
  
  for (const k of keys) {
    if (typeof result === 'string') return key;
    result = result[k];
  }
  
  return typeof result === 'string' ? result : key;
}
