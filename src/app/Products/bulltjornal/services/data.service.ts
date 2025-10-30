import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SubGoal {
  name: string;
  done: boolean;
  locked: boolean;
  targetDate: string; // اضافه کردن تاریخ به هر subgoal
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
      title: 'هدف',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#6a11cb',
      progress: 60,
      subgoal: [
        { name: 'هدف 1.1', done: true, locked: false, targetDate: '1404-08-05' },
        { name: 'هدف 1.2', done: false, locked: true, targetDate: '1404-08-05' },
        { name: 'هدف 1.3', done: false, locked: true, targetDate: '1404-08-06' },
        { name: 'هدف 1.4', done: false, locked: true, targetDate: '1404-08-10' },
        { name: 'هدف 1.5', done: false, locked: true, targetDate: '1404-08-15' },
        { name: 'هدف 1.6', done: false, locked: true, targetDate: '1404-09-20' },
      ],
    },
    {
      title: 'هدف 2',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#ff9100',
      progress: 60,
      subgoal: [
        { name: 'هدف 2.1', done: true, locked: false, targetDate: '1404-08-5' },
        { name: 'هدف 2.2', done: false, locked: true, targetDate: '1404-08-12' },
      ],
    },
    {
      title: 'هدف3',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#ff4c60',
      progress: 60,
      subgoal: [ 
        { name: 'هدف 3.1', done: true, locked: false, targetDate: '1404-08-04' },
        { name: 'هدف 3.2', done: false, locked: true, targetDate: '1404-11-05' },
        { name: 'هدف 3.3', done: false, locked: true, targetDate: '1404-11-10' },
        { name: 'هدف 3.4', done: false, locked: true, targetDate: '1404-11-15' },
      ],
    },
    {
      title: 'هدف 4',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#ffd500',
      progress: 60,
      subgoal: [
        { name: 'هدف 4.1', done: true, locked: false, targetDate: '1405-03-03' },
        { name: 'هدف 4.2', done: false, locked: true, targetDate: '1405-03-10' },
      ],
    },
  ];

  getGoals(): Observable<Goal[]> {
    return of(this.goalsData);
  }
}