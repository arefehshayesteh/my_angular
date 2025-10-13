import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Step {
  name: string;
  done: boolean;
  locked: boolean;
}

export interface Goal {
  title: string;
  description: string;
  steps: Step[];
  color?: string;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  // داده‌های مستقیم در سرویس
  private goalsData: Goal[] = [
    {
      "title": "خواندن برای قبولی کنکور",
      "description": "مطالعه دروس تخصصی کنکور",
      "color": "#FF7E7E",
      "progress": 60,
      "steps": [
        { "name": "مرحله ۱", "done": false, "locked": false },
        { "name": "مرحله ۲", "done": false, "locked": true },
        { "name": "مرحله ۳", "done": false, "locked": true },
        { "name": "مرحله ۴", "done": false, "locked": true }
      ]
    },
    {
      "title": "خواندن برای قبولی کنکور", 
      "description": "تمرین تست‌زنی و زمان‌بندی",
      "color": "#FF7E7E",
      "progress": 20,
      "steps": [
        { "name": "مرحله ۱", "done": false, "locked": true },
        { "name": "مرحله ۲", "done": false, "locked": true }
      ]
    },
    {
      "title": "خواندن برای قبولی کنکور",
      "description": "مرور و جمع‌بندی نهایی", 
      "color": "#FF7E7E",
      "progress": 60,
      "steps": [
        { "name": "مرحله ۱", "done": false, "locked": true },
        { "name": "مرحله ۲", "done": false, "locked": true },
        { "name": "مرحله ۳", "done": false, "locked": true },
        { "name": "مرحله ۴", "done": false, "locked": true }
      ]
    },
    {
      "title": "هدف ۴",
      "description": "توضیحات هدف ۴",
      "color": "#FF7E7E",
      "progress": 60,
      "steps": [
        { "name": "مرحله ۱", "done": false, "locked": true },
        { "name": "مرحله ۲", "done": false, "locked": true },
        { "name": "مرحله ۳", "done": false, "locked": true }
      ]
    }
  ];

  constructor() {}

  getGoals(): Observable<Goal[]> {
    // بازگرداندن داده‌ها به عنوان Observable
    return of(this.goalsData);
  }

  // متد برای آپدیت اهداف در صورت نیاز
  updateGoal(updatedGoal: Goal): void {
    const index = this.goalsData.findIndex(goal => goal.title === updatedGoal.title);
    if (index !== -1) {
      this.goalsData[index] = updatedGoal;
    }
  }

  // متد برای حذف هدف
  deleteGoal(goalToDelete: Goal): void {
    this.goalsData = this.goalsData.filter(goal => goal !== goalToDelete);
  }

  // متد برای اضافه کردن هدف جدید
  addGoal(newGoal: Goal): void {
    this.goalsData.push(newGoal);
  }
}