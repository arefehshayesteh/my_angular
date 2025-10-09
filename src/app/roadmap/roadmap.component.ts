import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  name: string;
  done: boolean;
}

interface RoadItem {
  title: string;
  description: string;
  steps: Step[];
}

interface Point {
  id: number;
  label: string;
  x: number;
  y: number;
  progress: number;
  isStep?: boolean;
  stepName?: string;
  stepDone?: boolean;
  isLocked?: boolean;
}

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss']
})
export class RoadmapComponent implements AfterViewInit {
  @ViewChild('svgContainer', { static: true })
  svgContainer!: ElementRef<HTMLDivElement>;

  data: RoadItem[] = [
    {
      title: 'شروع پروژه',
      description: 'تحلیل نیازمندی‌ها',
      steps: [
        { name: 'جلسه با کارفرما', done: true },
        { name: 'نوشتن داکیومنت نیازمندی', done: true },
        { name: 'تایید نهایی', done: false }
      ]
    },
    {
      title: 'طراحی اولیه',
      description: 'ساخت وایرفریم و UI',
      steps: [
        { name: 'طراحی وایرفریم', done: false },
        { name: 'UI در Figma', done: false }
      ]
    },
    {
      title: 'توسعه',
      description: 'کدنویسی و پیاده‌سازی',
      steps: [
        { name: 'ایجاد پروژه', done: false },
        { name: 'کدنویسی صفحات', done: false },
        { name: 'اتصال به API', done: false }
      ]
    },
    {
      title: 'تست نهایی',
      description: 'بررسی و رفع باگ‌ها',
      steps: [
        { name: 'تست عملکرد', done: false },
        { name: 'رفع باگ‌ها', done: false }
      ]
    }
  ];

  points: Point[] = [];
  hoveredPoint: Point | null = null;

  constructor(private cd: ChangeDetectorRef) {}

  getProgress(item: RoadItem): number {
    const total = item.steps.length;
    const done = item.steps.filter(s => s.done).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  async ngAfterViewInit() {
    const response = await fetch('assets/road.svg');
    const svgText = await response.text();
    this.svgContainer.nativeElement.innerHTML = svgText;

    const path = this.svgContainer.nativeElement.querySelector(
      '#roadPath'
    ) as SVGPathElement | null;

    if (!path) {
      console.error('مسیر roadPath پیدا نشد');
      return;
    }

    const pathLength = path.getTotalLength();
    const numGoals = this.data.length;
    const totalSteps = this.data.reduce((sum, g) => sum + g.steps.length, 0);
    const totalPoints = numGoals + totalSteps;

    const stepDistance = pathLength / (totalPoints + 1);
    let currentLength = stepDistance;

    const newPoints: Point[] = [];
    let prevGoalsDone = true;

    this.data.forEach(goal => {
      // مراحل
      for (let step of goal.steps) {
        const pt = path.getPointAtLength(currentLength);
        newPoints.push({
          id: newPoints.length + 1,
          label: step.name,
          x: pt.x,
          y: pt.y,
          progress: 0,
          isStep: true,
          stepName: step.name,
          stepDone: step.done,
          isLocked: !prevGoalsDone
        });
        currentLength += stepDistance;
      }

      // هدف
      const ptGoal = path.getPointAtLength(currentLength);
      const progress = this.getProgress(goal);
      const goalDone = progress === 100;
      newPoints.push({
        id: newPoints.length + 1,
        label: `${goal.title} - ${progress}%`,
        x: ptGoal.x,
        y: ptGoal.y,
        progress,
        isLocked: !prevGoalsDone
      });
      prevGoalsDone = goalDone;
      currentLength += stepDistance;
    });

    this.points = newPoints;
    this.cd.detectChanges();
  }

  getColor(progress: number, isLocked: boolean): string {
    if (isLocked) return '#999999';
    if (progress === 100) return '#4caf50';
    if (progress >= 50) return '#ffb703';
    return '#bdbdbd';
  }

  getStepColor(done?: boolean, isLocked?: boolean): string {
    if (isLocked) return '#999999';
    return done ? '#4caf50' : '#cccccc';
  }

  toggleStep(point: Point) {
    if (!point.isStep || point.isLocked) return;
  
    point.stepDone = !point.stepDone;
  
    // پیدا کردن هدف مربوطه
    const goalIndex = this.data.findIndex(g =>
      g.steps.some(s => s.name === point.stepName)
    );
  
    if (goalIndex === -1) return;
  
    // تغییر وضعیت مرحله در داده اصلی
    const goal = this.data[goalIndex];
    const step = goal.steps.find(s => s.name === point.stepName);
    if (step) step.done = point.stepDone;
  
    // بروزرسانی درصد پیشرفت هدف
    const progress = this.getProgress(goal);
  
    // بروزرسانی توپ هدف در points
    const goalPoint = this.points.find(
      p => !p.isStep && p.label.includes(goal.title)
    );
    if (goalPoint) goalPoint.progress = progress;
  
    // اگر هدف کامل شد، بعدی آزاد شود
    if (progress === 100 && goalIndex + 1 < this.data.length) {
      const nextGoalSteps = this.data[goalIndex + 1].steps.map(s => s.name);
      this.points.forEach(p => {
        if (nextGoalSteps.includes(p.stepName ?? '') || p.label.includes(this.data[goalIndex + 1].title)) {
          p.isLocked = false;
        }
      });
    }
  
    this.cd.detectChanges();
  }
  
}
