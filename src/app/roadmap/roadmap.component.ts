import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  name: string;
  done: boolean;
  locked: boolean;
}

interface RoadItem {
  title: string;
  description: string;
  steps: Step[];
  unlocked: boolean;
}

interface Point {
  id: string;
  x: number;
  y: number;
  type: 'goal' | 'step';
  goalIndex: number;
  stepIndex?: number;
}

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
})
export class RoadmapComponent implements AfterViewInit {
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;
  points: Point[] = [];
  tooltipGoal: number | null = null;
  mainGoalIndex: number = 0;
  progressPercent: number = 0;

  roadmap: RoadItem[] = [
    {
      title: 'هدف ۱',
      description: 'توضیحات هدف ۱',
      unlocked: true,
      steps: [
        { name: 'مرحله ۱', done: true, locked: false },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۳', done: false, locked: true },
        { name: 'مرحله ۱', done: true, locked: false },
        { name: 'مرحله ۲', done: true, locked: false },
        { name: 'مرحله ۳', done: true, locked: false },
        { name: 'مرحله ۴', done: true, locked: false },
        { name: 'مرحله ۵', done: false, locked: true },
        { name: 'مرحله ۶', done: false, locked: true },
      ],
    },
    {
      title: 'هدف ۲',
      description: 'توضیحات هدف ۲',
      unlocked: false,
      steps: [
        { name: 'مرحله ۱', done: true, locked: false },
        { name: 'مرحله ۲', done: true, locked: false },
        { name: 'مرحله ۳', done: false, locked: false },
        { name: 'مرحله ۴', done: false, locked: true },
      ],
    },
    
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  async ngAfterViewInit() {
    await this.loadSvgAndGeneratePoints();
    window.addEventListener('resize', () => this.loadSvgAndGeneratePoints());
  }

  async loadSvgAndGeneratePoints() {
    const container = this.svgContainer.nativeElement;
    const svgResponse = await fetch('assets/road.svg');
    const svgText = await svgResponse.text();
    container.innerHTML = svgText;
  
    const svgEl = container.querySelector('svg');
    const path = svgEl.querySelector('#roadPath');
    if (!path) return;
  
    const pathLength = path.getTotalLength();
  
    // 🔹 هدف اصلی = هدف با بیشترین مراحل
    this.mainGoalIndex = this.roadmap.reduce(
      (maxIdx, g, i, arr) =>
        g.steps.length > arr[maxIdx].steps.length ? i : maxIdx,
      0
    );
  
    const mainGoal = this.roadmap[this.mainGoalIndex];
    const totalMainSteps = mainGoal.steps.length;
  
    const stepDistance = pathLength / (totalMainSteps + 2);
    const newPoints: Point[] = [];
  
    // 🔹 نقاط هدف اصلی (تمام مراحلش + خودش)
    let currentLength = stepDistance;
    for (let i = 0; i < totalMainSteps; i++) {
      const pt = path.getPointAtLength(currentLength);
      newPoints.push({
        id: `main-step-${i}`,
        x: pt.x,
        y: pt.y,
        type: 'step',
        goalIndex: this.mainGoalIndex,
        stepIndex: i,
      });
      currentLength += stepDistance;
    }
  
    // 🔹 نقطه نهایی هدف اصلی
    const lastPt = path.getPointAtLength(currentLength);
    newPoints.push({
      id: `main-goal`,
      x: lastPt.x,
      y: lastPt.y,
      type: 'goal',
      goalIndex: this.mainGoalIndex,
    });
  
    // 🔹 بقیه اهداف کوچکتر را روی مسیر هدف اصلی مپ کن
    this.roadmap.forEach((goal, gIndex) => {
      if (gIndex === this.mainGoalIndex) return;
  
      const relativeStep = Math.min(goal.steps.length, totalMainSteps - 1);
      const mainPoint = newPoints.find(
        (p) => p.stepIndex === relativeStep - 1 && p.type === 'step'
      );
  
      if (mainPoint) {
        newPoints.push({
          id: `goal${gIndex}`,
          x: mainPoint.x,
          y: mainPoint.y,
          type: 'goal',
          goalIndex: gIndex,
        });
      }
    });
  
    this.points = newPoints;
    this.updateProgress();
    this.cdr.detectChanges();
  }
  
  updateProgress() {
    const mainGoal = this.roadmap[this.mainGoalIndex];
    const done = mainGoal.steps.filter((s) => s.done).length;
    this.progressPercent = Math.round((done / mainGoal.steps.length) * 100);
  }
  

  openTooltip(goalIndex: number, event: MouseEvent) {
    event.stopPropagation(); // جلوگیری از بسته شدن تولتیپ
    if (goalIndex === this.mainGoalIndex) this.tooltipGoal = goalIndex;
  }

  closeTooltip() {
    this.tooltipGoal = null;
  }
}
