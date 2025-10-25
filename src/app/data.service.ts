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
  deadline: number;
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
      deadline : 365,
      subgoal: [
        { name: 'هدف ۱', done: true, locked: false },
        { name: 'هدف ۲', done: false, locked: true },
        { name: 'هدف ۳', done: false, locked: true },
        { name: 'هدف 4', done: true, locked: false },
        { name: 'هدف 5', done: false, locked: true },
        { name: 'هدف 6', done: false, locked: true }
      ],
    },
    {
      title: 'هدف 1',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#FF7E7E',
      progress: 60,
      deadline : 10,
      subgoal: [
        { name: 'هدف ۱', done: true, locked: false },
        { name: 'هدف ۲', done: false, locked: true },
        
      ],
    },
    {
      title: 'هدف2',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#FF7E7E',
      progress: 60,
      deadline : 30,
      subgoal: [
        { name: 'هدف ۱', done: true, locked: false },
        { name: 'هدف ۲', done: false, locked: true },
        
      ],
    },
    {
      title: 'هدف 3',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#FF7E7E',
      progress: 60,
      deadline : 40,
      subgoal: [
        { name: 'هدف ۱', done: true, locked: false },
        { name: 'هدف ۲', done: false, locked: true },
        
      ],
    },
    {
      title: 'هدف 4',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#FF7E7E',
      progress: 60,
      deadline : 20,
      subgoal: [
        { name: 'هدف ۱', done: true, locked: false },
        { name: 'هدف ۲', done: false, locked: true },
        
      ],
    },
    {
      title: 'هدف5',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#FF7E7E',
      progress: 60,
      deadline : 100,
      subgoal: [
        { name: 'هدف ۱', done: true, locked: false },
        { name: 'هدف ۲', done: false, locked: true },
        
      ],
    },
    {
      title: 'هدف 6',
      description: 'مطالعه دروس تخصصی کنکور',
      color: '#FF7E7E',
      progress: 60,
      deadline : 730,
      subgoal: [
        { name: 'هدف ۱', done: true, locked: false },
        { name: 'هدف ۲', done: false, locked: true },
        
      ],
    },
  ];

  getGoals(): Observable<Goal[]> {
    return of(this.goalsData);
  }
}
