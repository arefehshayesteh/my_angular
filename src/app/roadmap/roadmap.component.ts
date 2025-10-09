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

interface Goal {
  title: string;
  steps: Step[];
}

interface Point {
  id: number;
  x: number;
  y: number;
  label: string;
  isStep?: boolean;
  stepDone?: boolean;
  isLocked?: boolean;
  progress?: number;
}

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss']
})
export class RoadmapComponent implements AfterViewInit {
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef<HTMLDivElement>;

  goals: Goal[] = [
    {
      title: 'هدف اول',
      steps: [
        { name: 'مرحله ۱', done: true },
        { name: 'مرحله ۲', done: false }
      ]
    },
    {
      title: 'هدف دوم',
      steps: [
        { name: 'مرحله ۱', done: false },
        { name: 'مرحله ۲', done: false }
      ]
    },
    {
      title: 'هدف سوم',
      steps: [
        { name: 'مرحله ۱', done: false }
      ]
    }
  ];

  points: Point[] = [];
  activePoint: Point | null = null;

  constructor(private cd: ChangeDetectorRef) {}

  getProgress(goal: Goal): number {
    const total = goal.steps.length;
    const done = goal.steps.filter(s => s.done).length;
    return Math.round((done / total) * 100);
  }

  async ngAfterViewInit() {
    const response = await fetch('assets/road.svg');
    const svgText = await response.text();
    this.svgContainer.nativeElement.innerHTML = svgText;

    const path = this.svgContainer.nativeElement.querySelector('#roadPath') as SVGPathElement;
    if (!path) {
      console.error('❌ مسیر roadPath پیدا نشد.');
      return;
    }

    const pathLength = path.getTotalLength();
    const totalPoints = this.goals.reduce((sum, g) => sum + g.steps.length + 1, 0);
    const stepDistance = pathLength / (totalPoints + 1);
    let currentLength = stepDistance;

    const generated: Point[] = [];
    let locked = false;

    for (const goal of this.goals) {
      // مراحل هر هدف
      for (const step of goal.steps) {
        const pt = path.getPointAtLength(currentLength);
        generated.push({
          id: generated.length + 1,
          label: step.name,
          x: pt.x,
          y: pt.y,
          isStep: true,
          stepDone: step.done,
          isLocked: locked
        });
        currentLength += stepDistance;
      }

      // خود هدف
      const goalPt = path.getPointAtLength(currentLength);
      const progress = this.getProgress(goal);
      generated.push({
        id: generated.length + 1,
        label: `${goal.title} (${progress}%)`,
        x: goalPt.x,
        y: goalPt.y,
        progress,
        isLocked: locked
      });

      // قفل شدن هدف‌های بعدی
      if (progress < 100) locked = true;
      currentLength += stepDistance;
    }

    this.points = generated;
    this.cd.detectChanges();
  }

  getColor(p: Point): string {
    if (p.isLocked) return '#bbb';
    if (p.progress === 100) return '#4caf50';
    if (p.progress && p.progress >= 50) return '#ffb703';
    return '#f7b500';
  }

  getStepColor(p: Point): string {
    if (p.isLocked) return '#bbb';
    return p.stepDone ? '#4caf50' : '#8e44ad';
  }

  toggleTooltip(p: Point, event: MouseEvent) {
    event.stopPropagation();
    console.log('clicked on:', p.label);
    this.activePoint = p;
    this.cd.detectChanges();
  }
  
  

  toggleStep(p: Point) {
    if (p.isLocked) return;
    p.stepDone = !p.stepDone;
  }

  closeTooltip() {
    this.activePoint = null;
  }
}
