import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Goal, SubGoal } from '../data.service';

// اینترفیس برای نمایش subgoalها به صورت مستقل
interface DisplayItem {
  parentGoal: Goal;
  subGoal: SubGoal;
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  tabs = ['روزانه', 'هفتگی', 'ماهانه', 'سالانه'];
  activeTab = 'روزانه';
  
  // تاریخ جاری
  currentDate: Date = new Date();
  date: string = '';
  description: string = '';
  
  displayItems: DisplayItem[] = []; // آیتم‌های نمایشی (subgoalها)
  openedMenuIndex: number | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.updateDateDisplay();
    this.loadGoals();
  }

  // تبدیل تاریخ به فارسی
  private toPersianDate(date: Date): string {
    const gregorianDate = new Date(date);
    const persianDate = this.gregorianToJalali(
      gregorianDate.getFullYear(),
      gregorianDate.getMonth() + 1,
      gregorianDate.getDate()
    );

    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    
    const persianDays = [
      'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 
      'پنجشنبه', 'جمعه', 'شنبه'
    ];

    const dayOfWeek = persianDays[gregorianDate.getDay()];
    const day = persianDate.day;
    const month = persianMonths[persianDate.month - 1];
    const year = persianDate.year;

    return `${dayOfWeek} ${day} ${month} ${year}`;
  }

  // الگوریتم تبدیل میلادی به شمسی
  private gregorianToJalali(gy: number, gm: number, gd: number): { year: number, month: number, day: number } {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = (gy <= 1600) ? 0 : 979;
    gy -= (gy <= 1600) ? 621 : 1600;
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) 
      + (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * (Math.floor(days / 12053)); 
    days %= 12053;
    jy += 4 * (Math.floor(days / 1461));
    days %= 1461;
    jy += Math.floor((days - 1) / 365);
    if (days > 365) days = (days - 1) % 365;
    let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    
    return { year: jy, month: jm, day: jd };
  }

  // تبدیل شمسی به میلادی برای محاسبات
  private jalaliToGregorian(jy: number, jm: number, jd: number): Date {
    jy += 1595;
    let days = -355668 + (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) 
      + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let gd = days + 1;
    const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm;
    for (gm = 0; gm < 13; gm++) {
      let v = sal_a[gm];
      if (gd <= v) break;
      gd -= v;
    }
    
    return new Date(gy, gm - 1, gd);
  }

  // تولید توضیحات خودکار بر اساس روز
  private generateDescription(date: Date): string {
    const dayOfWeek = date.getDay();
    const descriptions = [
      'امروز شما تا ۳ تمرین داشتی و ۲ تایم کامل انجام دادی و بخشی از نیمه انجام دادی',
      'امروز شما تا ۲ تمرین داشتی و ۱ تایم کامل انجام دادی',
      'امروز شما تا ۴ تمرین داشتی و ۳ تایم کامل انجام دادی',
      'امروز شما تا ۱ تمرین داشتی و بخشی از نیمه انجام دادی',
      'امروز شما تا ۳ تمرین داشتی و ۲ تایم کامل انجام دادی',
      'امروز تعطیل است - استراحت کنید',
      'امروز شما تا ۲ تمرین داشتی و ۱ تایم کامل انجام دادی'
    ];

    return descriptions[dayOfWeek];
  }

  // آپدیت نمایش تاریخ
  private updateDateDisplay(): void {
    this.date = this.toPersianDate(this.currentDate);
    this.description = this.generateDescription(this.currentDate);
  }

  // بارگذاری اهداف - تغییر داده شده برای نمایش subgoalها
  private loadGoals(): void {
    this.dataService.getGoals().subscribe({
      next: (data) => {
        console.log('تمامی اهداف:', data);
        this.displayItems = this.filterItemsByTab(data, this.activeTab);
        console.log('آیتم‌های فیلتر شده:', this.displayItems);
      },
      error: (error) => {
        console.error('خطا در دریافت داده:', error);
      }
    });
  }

  // فیلتر کردن آیتم‌ها بر اساس تب فعال - اصلاح شده برای استفاده از تاریخ subgoalها
  private filterItemsByTab(goals: Goal[], tab: string): DisplayItem[] {
    const allItems: DisplayItem[] = [];
    
    // تبدیل تمام subgoalها به آیتم‌های نمایشی
    goals.forEach(goal => {
      goal.subgoal.forEach(subGoal => {
        allItems.push({
          parentGoal: goal,
          subGoal: subGoal
        });
      });
    });

    // فیلتر بر اساس تب (با استفاده از تاریخ subgoal)
    const filteredItems = allItems.filter(item => {
      switch (tab) {
        case 'روزانه':
          return this.isSameDay(item.subGoal.targetDate, this.currentDate);
        case 'هفتگی':
          return this.isSameWeek(item.subGoal.targetDate, this.currentDate);
        case 'ماهانه':
          const result = this.isSameMonth(item.subGoal.targetDate, this.currentDate);
          console.log(`ساب‌گول "${item.subGoal.name}" با تاریخ ${item.subGoal.targetDate}: ${result}`);
          return result;
        case 'سالانه':
          return this.isSameYear(item.subGoal.targetDate, this.currentDate);
        default:
          return true;
      }
    });
    
    console.log(`فیلتر ${tab}: ${filteredItems.length} ساب‌گول پیدا شد`);
    return filteredItems;
  }

  private parsePersianDate(persianDate: string): { year: number, month: number, day: number } {
    const cleanDate = persianDate.trim();
    const parts = cleanDate.split('-').map(part => parseInt(part, 10));
    
    if (parts.length !== 3 || parts.some(isNaN)) {
      console.error('فرمت تاریخ اشتباه:', persianDate);
      return { year: 0, month: 0, day: 0 };
    }
    
    return { 
      year: parts[0], 
      month: parts[1], 
      day: parts[2] 
    };
  }

  private isSameDay(goalDate: string, reference: Date): boolean {
    const goalShamsi = this.parsePersianDate(goalDate);
    const referenceShamsi = this.gregorianToJalali(
      reference.getFullYear(),
      reference.getMonth() + 1,
      reference.getDate()
    );
    
    return goalShamsi.year === referenceShamsi.year &&
           goalShamsi.month === referenceShamsi.month &&
           goalShamsi.day === referenceShamsi.day;
  }

  private isSameWeek(goalDate: string, reference: Date): boolean {
    const goalShamsi = this.parsePersianDate(goalDate);
    const goalGregorian = this.jalaliToGregorian(goalShamsi.year, goalShamsi.month, goalShamsi.day);
    
    const referenceCopy = new Date(reference);
    const dayOfWeek = referenceCopy.getDay(); // 0=یکشنبه, 6=شنبه
    
    const startOfWeek = new Date(referenceCopy);
    startOfWeek.setDate(referenceCopy.getDate() - dayOfWeek - 1); // رفتن به شنبه
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // پایان هفته = جمعه
    
    return goalGregorian >= startOfWeek && goalGregorian <= endOfWeek;
  }

  private isSameMonth(goalDate: string, reference: Date): boolean {
    const goalShamsi = this.parsePersianDate(goalDate);
    const referenceShamsi = this.gregorianToJalali(
      reference.getFullYear(),
      reference.getMonth() + 1,
      reference.getDate()
    );
    return goalShamsi.year === referenceShamsi.year &&
           goalShamsi.month === referenceShamsi.month;
  }

  private isSameYear(goalDate: string, reference: Date): boolean {
    const goalShamsi = this.parsePersianDate(goalDate);
    const referenceShamsi = this.gregorianToJalali(
      reference.getFullYear(),
      reference.getMonth() + 1,
      reference.getDate()
    );
    
    return goalShamsi.year === referenceShamsi.year;
  }

  // توابع نویگیشن
  private previousDay(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() - 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.loadGoals();
  }

  private nextDay(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.loadGoals();
  }

  private previousWeek(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.loadGoals();
  }

  private nextWeek(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.loadGoals();
  }

  private previousMonth(): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.loadGoals();
  }

  private nextMonth(): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.loadGoals();
  }

  private previousYear(): void {
    const newDate = new Date(this.currentDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.loadGoals();
  }

  private nextYear(): void {
    const newDate = new Date(this.currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
    this.loadGoals();
  }

  // مدیریت فلش‌ها بر اساس تب فعال
  handlePrevious(): void {
    switch (this.activeTab) {
      case 'روزانه':
        this.previousDay();
        break;
      case 'هفتگی':
        this.previousWeek();
        break;
      case 'ماهانه':
        this.previousMonth();
        break;
      case 'سالانه':
        this.previousYear();
        break;
    }
  }
  
  handleNext(): void {
    switch (this.activeTab) {
      case 'روزانه':
        this.nextDay();
        break;
      case 'هفتگی':
        this.nextWeek();
        break;
      case 'ماهانه':
        this.nextMonth();
        break;
      case 'سالانه':
        this.nextYear();
        break;
    }
  }

  setActive(tab: string) {
    this.activeTab = tab;
    this.currentDate = new Date(); // بازگشت به تاریخ امروز هنگام تغییر تب
    this.updateDateDisplay();
    this.loadGoals();
  }

  toggleMenu(index: number) {
    this.openedMenuIndex = this.openedMenuIndex === index ? null : index;
  }

  closeAllMenus() {
    this.openedMenuIndex = null;
  }

  editGoal(item: DisplayItem) {
    console.log('ویرایش ساب‌گول:', item);
    this.closeAllMenus();
  }

  selectPriority(item: DisplayItem) {
    console.log('انتخاب اولویت برای:', item);
    this.closeAllMenus();
  }

  showReport(item: DisplayItem) {
    console.log('نمایش گزارش برای:', item);
    this.closeAllMenus();
  }
}