import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SubGoal {
  name: string;
  done: boolean;
  locked: boolean;
}

export interface Goal {
  title: string;
  description: string;
  color: string;
  progress: number;
  subgoal: SubGoal[];
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private goalsData: Goal[] = [
    {
      title: 'هدف اصلی',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#FF7E7E',
      progress: 60,
      subgoal: [
        { name: 'هدف ۱', done: true, locked: false },
        { name: 'هدف ۲', done: false, locked: true },
        { name: 'هدف ۳', done: false, locked: true },
        { name: 'هدف ۴', done: false, locked: true },
        { name: 'هدف ۵', done: false, locked: false },
        { name: 'هدف ۴', done: false, locked: true },
        { name: 'هدف ۵', done: false, locked: false }
      ],
      
      {
        "title": "هدف ۲",
        "description": "تمرین تست‌زنی و زمان‌بندی",
        "color": "#00AEEF",
        "progress": 20,
        "step": [
          { "name": "مرحله ۱", "done": false, "locked": false },
          { "name": "مرحله ۲", "done": false, "locked": false },
          { "name": "مرحله ۳", "done": false, "locked": true },
          { "name": "مرحله ۴", "done": false, "locked": true },
          { "name": "مرحله ۵", "done": false, "locked": true }
        ],

    },
  ];

  getGoals(): Observable<Goal[]> {
    return of(this.goalsData);
  }
}
