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
    {
      title: 'هدف ۳',
      description: 'توضیحات هدف ۳',
      unlocked: false,
      steps: [
        { name: 'مرحله ۱', done: true, locked: false },
        { name: 'مرحله ۲', done: true, locked: false },
        { name: 'مرحله ۳', done: true, locked: false },
        { name: 'مرحله ۴', done: true, locked: false },
        { name: 'مرحله ۵', done: false, locked: true },
        { name: 'مرحله ۶', done: false, locked: true },
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

    // پیدا کردن هدف اصلی
    this.mainGoalIndex = this.roadmap.reduce(
      (maxIdx, g, i, arr) =>
        g.steps.length > arr[maxIdx].steps.length ? i : maxIdx,
      0
    );
    const mainGoal = this.roadmap[this.mainGoalIndex];
    const mainSteps = mainGoal.steps.length;

    // جمع کل مراحل برای تمام اهداف
    const totalSteps = this.roadmap.reduce(
      (sum, g) => sum + g.steps.length + 1, // +1 برای خود هدف
      0
    );

    // فاصله مساوی برای کل مسیر
    const stepDistance = pathLength / (totalSteps + 1);
    const newPoints: Point[] = [];

    let currentLength = stepDistance;
    this.roadmap.forEach((goal, gIndex) => {
      goal.steps.forEach((_, sIndex) => {
        const pt = path.getPointAtLength(currentLength);
        newPoints.push({
          id: `goal${gIndex}-step${sIndex}`,
          x: pt.x,
          y: pt.y,
          type: 'step',
          goalIndex: gIndex,
          stepIndex: sIndex,
        });
        currentLength += stepDistance;
      });

      // نقطه هدف
      const pt = path.getPointAtLength(currentLength);
      newPoints.push({
        id: `goal${gIndex}`,
        x: pt.x,
        y: pt.y,
        type: 'goal',
        goalIndex: gIndex,
      });
      currentLength += stepDistance;
    });

    // درصد پیشرفت هدف اصلی
    const done = mainGoal.steps.filter((s) => s.done).length;
    this.progressPercent = Math.round((done / mainSteps) * 100);

    this.points = newPoints;
    this.cdr.detectChanges();
  }

  openTooltip(goalIndex: number, event: MouseEvent) {
    event.stopPropagation(); // جلوگیری از بسته شدن تولتیپ
    if (goalIndex === this.mainGoalIndex) this.tooltipGoal = goalIndex;
  }

  closeTooltip() {
    this.tooltipGoal = null;
  }
}
