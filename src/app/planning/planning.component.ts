import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Goal, SubGoal } from '../data.service';

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
  
  currentDate: Date = new Date();
  date: string = '';
  description: string = '';
  
  displayItems: DisplayItem[] = [];
  openedMenuIndex: number | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.updateDateDisplay();
    this.loadGoals();
  }

  // ✅ این تابع حالا بررسی می‌کند آیا هدفی انتخاب شده یا نه
  private loadGoals(): void {
    this.dataService.getGoals().subscribe({
      next: (data) => {
        console.log('تمامی اهداف:', data);

        // 🟢 بررسی انتخاب هدف از Roadmap
        const selectedGoalTitle = localStorage.getItem('selectedGoalTitle');
        let filteredGoals: Goal[];

        if (selectedGoalTitle) {
          filteredGoals = data.filter(g => g.title.trim() === selectedGoalTitle.trim());
          console.log(`🎯 فقط هدف "${selectedGoalTitle}" نمایش داده می‌شود`);
        } else {
          filteredGoals = data;
          console.log('📋 هیچ هدفی انتخاب نشده — همه ساب‌گول‌ها نمایش داده می‌شوند');
        }

        this.displayItems = this.filterItemsByTab(filteredGoals, this.activeTab);
        console.log('✅ آیتم‌های نهایی برای نمایش:', this.displayItems);
      },
      error: (error) => {
        console.error('❌ خطا در دریافت داده:', error);
      }
    });
  }

  // ==============================
  // تاریخ شمسی + فیلترها
  // ==============================

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

  private gregorianToJalali(gy: number, gm: number, gd: number): { year: number, month: number, day: number } {
    const g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334];
    let jy = (gy<=1600)?0:979;
    gy -= (gy<=1600)?621:1600;
    const gy2 = (gm>2)?(gy+1):gy;
    let days = (365*gy)+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)-80+gd+g_d_m[gm-1];
    jy += 33*Math.floor(days/12053);
    days %= 12053;
    jy += 4*Math.floor(days/1461);
    days %= 1461;
    jy += Math.floor((days-1)/365);
    if (days>365) days = (days-1)%365;
    const jm = (days<186)?1+Math.floor(days/31):7+Math.floor((days-186)/30);
    const jd = 1+((days<186)?(days%31):((days-186)%30));
    return {year:jy, month:jm, day:jd};
  }

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

  private updateDateDisplay(): void {
    this.date = this.toPersianDate(this.currentDate);
    this.description = this.generateDescription(this.currentDate);
  }

  private parsePersianDate(persianDate: string): { year: number, month: number, day: number } {
    const clean = persianDate.trim().replace(/\s/g, '');
    const parts = clean.split('-').map(x => parseInt(x, 10));
    return { year: parts[0], month: parts[1], day: parts[2] };
  }

  private isSameMonth(goalDate: string, reference: Date): boolean {
    const g = this.parsePersianDate(goalDate);
    const r = this.gregorianToJalali(reference.getFullYear(), reference.getMonth()+1, reference.getDate());
    return g.year === r.year && g.month === r.month;
  }

  private isSameYear(goalDate: string, reference: Date): boolean {
    const g = this.parsePersianDate(goalDate);
    const r = this.gregorianToJalali(reference.getFullYear(), reference.getMonth()+1, reference.getDate());
    return g.year === r.year;
  }

  private isSameDay(goalDate: string, reference: Date): boolean {
    const g = this.parsePersianDate(goalDate);
    const r = this.gregorianToJalali(reference.getFullYear(), reference.getMonth()+1, reference.getDate());
    return g.year === r.year && g.month === r.month && g.day === r.day;
  }

  private isSameWeek(goalDate: string, reference: Date): boolean {
    const g = this.parsePersianDate(goalDate);
    const gd = this.jalaliToGregorian(g.year, g.month, g.day);
    const ref = new Date(reference);
    const start = new Date(ref);
    start.setDate(ref.getDate() - ref.getDay() - 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return gd >= start && gd <= end;
  }

  private jalaliToGregorian(jy: number, jm: number, jd: number): Date {
    jy += 1595;
    let days = -355668 + (365 * jy) + (Math.floor(jy / 33) * 8)
      + Math.floor(((jy % 33) + 3) / 4)
      + jd + ((jm < 7) ? ((jm - 1) * 31) : (((jm - 7) * 30) + 186));
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
    const sal_a = [0,31,((gy%4===0&&gy%100!==0)||(gy%400===0))?29:28,31,30,31,30,31,31,30,31,30,31];
    let gm;
    for (gm=0; gm<13; gm++) {
      let v = sal_a[gm];
      if (gd <= v) break;
      gd -= v;
    }
    return new Date(gy, gm - 1, gd);
  }

  // ✅ فیلتر نهایی بر اساس تب
  private filterItemsByTab(goals: Goal[], tab: string): DisplayItem[] {
    const allItems: DisplayItem[] = [];

    goals.forEach(goal => {
      goal.subgoal.forEach(subGoal => {
        allItems.push({ parentGoal: goal, subGoal });
      });
    });

    return allItems.filter(item => {
      switch (tab) {
        case 'روزانه':
          return this.isSameDay(item.subGoal.targetDate, this.currentDate);
        case 'هفتگی':
          return this.isSameWeek(item.subGoal.targetDate, this.currentDate);
        case 'ماهانه':
          return this.isSameMonth(item.subGoal.targetDate, this.currentDate);
        case 'سالانه':
          return this.isSameYear(item.subGoal.targetDate, this.currentDate);
        default:
          return true;
      }
    });
  }

  // تب‌ها، ناوبری، منو...
  setActive(tab: string) {
    this.activeTab = tab;
    this.currentDate = new Date();
    this.updateDateDisplay();
    this.loadGoals();
  }

  handlePrevious() { /* ... مثل قبل ... */ }
  handleNext() { /* ... مثل قبل ... */ }
  toggleMenu(index: number) { /* ... مثل قبل ... */ }
  closeAllMenus() { this.openedMenuIndex = null; }
  editGoal(item: DisplayItem) { console.log(item); this.closeAllMenus(); }
  selectPriority(item: DisplayItem) { console.log(item); this.closeAllMenus(); }
  showReport(item: DisplayItem) { console.log(item); this.closeAllMenus(); }
}
