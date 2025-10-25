import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Goal } from '../data.service';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  tabs = ['روزانه', 'ماهانه', 'سالانه'];
  activeTab = 'روزانه';
  
  // تاریخ جاری
  currentDate: Date = new Date();
  date: string = '';
  description: string = '';
  
  goals: Goal[] = [];
  openedMenuIndex: number | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.updateDateDisplay();
    this.dataService.getGoals().subscribe({
      next: (data) => {
        this.goals = this.filterGoalsByTab(data, this.activeTab);
      },
      error: (error) => {
        console.error('خطا در دریافت داده:', error);
      }
    });
  }
  

  // تبدیل تاریخ به فارسی
  private toPersianDate(date: Date): string {
    const gregorianDate = new Date(date);
    
    // تبدیل به تاریخ شمسی (ساده شده)
    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    
    const persianDays = [
      'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 
      'پنجشنبه', 'جمعه', 'شنبه'
    ];

    const day = gregorianDate.getDate();
    const month = persianMonths[gregorianDate.getMonth()];
    const year = gregorianDate.getFullYear() - 621; // تبدیل به شمسی تقریبی
    const dayOfWeek = persianDays[gregorianDate.getDay()];

    return `${dayOfWeek} ${day} ${month} ${year}`;
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

  // رفتن به روز قبل
  previousDay(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() - 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
  }

  // رفتن به روز بعد
  nextDay(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
  }

  // رفتن به هفته قبل
  previousWeek(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate = newDate;
    this.updateDateDisplay();
  }

  // رفتن به هفته بعد
  nextWeek(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate = newDate;
    this.updateDateDisplay();
  }

  // رفتن به ماه قبل
  previousMonth(): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
  }

  // رفتن به ماه بعد
  nextMonth(): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate = newDate;
    this.updateDateDisplay();
  }

  // مدیریت فلش‌ها بر اساس تب فعال
  handlePrevious(): void {
    switch (this.activeTab) {
      case 'روزانه':
        this.previousDay();
        break;
      case 'ماهانه':
        this.previousWeek();
        break;
      case 'سالانه':
        this.previousMonth();
        break;
    }
  }

  handleNext(): void {
    switch (this.activeTab) {
      case 'روزانه':
        this.nextDay();
        break;
      case 'ماهانه':
        this.nextWeek();
        break;
      case 'سالانه':
        this.nextMonth();
        break;
    }
  }

  setActive(tab: string) {
    this.activeTab = tab;
    this.currentDate = new Date();
    this.updateDateDisplay();
  
    this.dataService.getGoals().subscribe((data) => {
      this.goals = this.filterGoalsByTab(data, tab);
    });
  }
  

  toggleMenu(index: number) {
    this.openedMenuIndex = this.openedMenuIndex === index ? null : index;
  }

  closeAllMenus() {
    this.openedMenuIndex = null;
  }

  editGoal(goal: Goal) {
    console.log('ویرایش رکورد:', goal);
    this.closeAllMenus();
  }

  selectPriority(goal: Goal) {
    console.log('انتخاب اولویت برای:', goal);
    this.closeAllMenus();
  }

  // selectColor(goal: Goal) {
  //   console.log('انتخاب رنگ برای:', goal);
  //   goal.color = this.getRandomColor();
  //   this.dataService.updateGoal(goal);
  //   this.closeAllMenus();
  // }

  showReport(goal: Goal) {
    console.log('نمایش گزارش برای:', goal);
    this.closeAllMenus();
  }

  // deleteGoal(goal: Goal) {
  //   if (confirm(`آیا از حذف "${goal.title}" مطمئن هستید؟`)) {
  //     this.dataService.deleteGoal(goal);
  //     this.goals = this.goals.filter(g => g !== goal);
  //     this.closeAllMenus();
  //   }
  // }

  private getRandomColor(): string {
    const colors = [
      '#FF7E7E', '#FFB07C', '#FFE47C', '#A3FF7C', 
      '#7CFFE4', '#7CB5FF', '#B57CFF', '#FF7CE4',
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  private filterGoalsByTab(goals: Goal[], tab: string): Goal[] {
  switch (tab) {
    case 'روزانه':
      return goals.filter(g => g.deadline < 30); // زیر ۳۰ روز
    case 'ماهانه':
      return goals.filter(g => g.deadline >= 30 && g.deadline < 365); // بین ۳۰ تا کمتر از ۳۶۵
    case 'سالانه':
      return goals.filter(g => g.deadline >= 365); // ۳۶۵ یا بیشتر
    default:
      return goals;
  }
}

}