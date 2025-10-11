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

  characterPosition: { x: number; y: number } | null = null;
  points: Point[] = [];
  tooltip: { goalIndex: number; stepIndex: number } | null = null;
  mainGoalIndex: number = 0;
  progressPercent: number = 0;

  roadmap: RoadItem[] = [
    {
      title: ' هدف اصلی',
      description: 'توضیحات هدف اصلی',
      steps: [
        { name: 'مرحله ۱', done: false, locked: false },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۳', done: false, locked: true },
        { name: 'مرحله ۴', done: false, locked: true },
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۳', done: false, locked: true },
        { name: 'مرحله ۴', done: false, locked: true },
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۳', done: false, locked: true },
        { name: 'مرحله ۴', done: false, locked: true },
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۳', done: false, locked: true },
        { name: 'مرحله ۴', done: false, locked: true },
      ],
    },
    {
      title: 'هدف ۲',
      description: 'توضیحات هدف ۲',
      steps: [
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
       
      ],
    },
    {
      title: 'هدف ۲',
      description: 'توضیحات هدف ۲',
      steps: [
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
       
      ],
    },
    {
      title: 'هدف ۲',
      description: 'توضیحات هدف ۲',
      steps: [
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
        { name: 'مرحله ۱', done: false, locked: true },
        { name: 'مرحله ۲', done: false, locked: true },
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

    // 🔹 انتخاب هدف اصلی
    this.mainGoalIndex = this.roadmap.reduce(
      (maxIdx, g, i, arr) =>
        g.steps.length > arr[maxIdx].steps.length ? i : maxIdx,
      0
    );

    const mainGoal = this.roadmap[this.mainGoalIndex];
    const totalMainSteps = mainGoal.steps.length;

    const stepDistance = pathLength / (totalMainSteps + 2);
    const newPoints: Point[] = [];

    // 🔹 ایجاد نقاط هدف اصلی
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

    // 🔹 هدف نهایی
    const endPt = path.getPointAtLength(currentLength);
    newPoints.push({
      id: `main-goal`,
      x: endPt.x,
      y: endPt.y,
      type: 'goal',
      goalIndex: this.mainGoalIndex,
    });

    // 🔹 سایر اهداف کوچکتر
this.roadmap.forEach((goal, gIndex) => {
  if (gIndex === this.mainGoalIndex) return;

  // هدف باید بعد از آخرین مرحله خودش قرار بگیرد
  const relStep = Math.min(goal.steps.length, totalMainSteps);
  const match = newPoints.find(
    (p) => p.stepIndex === relStep && p.type === 'step'
  );

  if (match) {
    newPoints.push({
      id: `goal${gIndex}`,
      x: match.x,
      y: match.y,
      type: 'goal',
      goalIndex: gIndex,
    });
  }
});


    this.points = newPoints;
    this.updateProgress();
    this.cdr.detectChanges();
  }

  openTooltip(goalIndex: number, stepIndex: number, event: MouseEvent) {
    event.stopPropagation();
    const step = this.roadmap[goalIndex].steps[stepIndex];
    if (!step.locked) {
      this.tooltip = { goalIndex, stepIndex };
    }
  }

  toggleStep(goalIndex: number, stepIndex: number) {
    const goal = this.roadmap[goalIndex];
    const step = goal.steps[stepIndex];
    if (step.locked) return;

    step.done = !step.done;
    if (step.done && stepIndex + 1 < goal.steps.length) {
      goal.steps[stepIndex + 1].locked = false;
    }
    this.tooltip = null;
    this.updateProgress();
    this.moveCharacterToStep(goalIndex, stepIndex);

  }

  moveCharacterToStep(goalIndex: number, stepIndex: number) {
    const point = this.points.find(
      (p) => p.goalIndex === goalIndex && p.stepIndex === stepIndex
    );
    if (point) {
      this.characterPosition = { x: point.x, y: point.y };
    }
  }
  

  updateProgress() {
    const mainGoal = this.roadmap[this.mainGoalIndex];
    const done = mainGoal.steps.filter((s) => s.done).length;
    this.progressPercent = Math.round((done / mainGoal.steps.length) * 100);
  }

  closeTooltip() {
    this.tooltip = null;
  }
  hasGoalMarkerAt(p: Point): boolean {
    const EPS = 0.5; // یا عدد کوچکتر/بزرگتر بنا به مقیاس SVGت
    return this.points.some(pt =>
      pt.type === 'goal' && Math.abs(pt.x - p.x) < EPS && Math.abs(pt.y - p.y) < EPS
    );
  }
  openMyCourses() {
    console.log('نمایش دوره‌های من');
    // یا اگر روت داری:
    // this.router.navigate(['/my-courses']);
  }
  
  
}

