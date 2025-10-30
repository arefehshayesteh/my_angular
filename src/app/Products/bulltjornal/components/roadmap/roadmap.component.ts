import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Goal } from '../../services/data.service';
@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  
})
export class RoadmapComponent implements AfterViewInit {
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;

  goals: Goal[] = [];
  totalPoints = 25;
  
 
  colorToIconMap: { [key: string]: string } = {
    '#6a11cb': 'assets/point1.svg', // بنفش
    '#ff9100': 'assets/point2.svg', // نارنجی
    '#ff4c60': 'assets/point3.svg', // قرمز
    '#ffd500': 'assets/point4.svg', // زرد
  };

  selectedGoal: Goal | null = null;
  showAllGoals: boolean = true;
  mainGoalWithMostSubgoals!: Goal;

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  async ngAfterViewInit() {
    this.dataService.getGoals().subscribe(async (goals) => {
      this.goals = goals;
      
      // پیدا کردن هدفی که بیشترین ساب‌گول را دارد
      this.mainGoalWithMostSubgoals = this.goals.reduce(
        (max, g) => (g.subgoal?.length || 0) > (max.subgoal?.length || 0) ? g : max
      );

      await this.loadSvgAndGeneratePoints();
    });
  }

  async loadSvgAndGeneratePoints() {
    const container = this.svgContainer.nativeElement;
    while (container.firstChild) container.removeChild(container.firstChild);
    container.innerHTML = '';

    const svgResponse = await fetch('assets/street (1).svg');
    const svgText = await svgResponse.text();
    container.innerHTML = svgText;

    const svg = container.querySelector('svg') as SVGSVGElement | null;
    if (!svg) {
      console.error('❌ SVG not found!');
      return;
    }

    // پاکسازی و تنظیمات SVG
    svg.removeAttribute('x');
    svg.removeAttribute('y');
    svg.removeAttribute('transform');
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';

    svg.querySelectorAll('.point-marker, .goal-marker, .goal-text, .subgoal-marker').forEach((el) => el.remove());

    // ایجاد نقاط روی مسیر
    const points: { x: number; y: number }[] = [];

    for (let i = 1; i <= this.totalPoints; i++) {
      const target = svg.querySelector(`[data-name="${i}"]`) as SVGPathElement | null;
      if (!target) continue;

      const pathLength = target.getTotalLength();
      const midpoint = target.getPointAtLength(pathLength / 2);
      let totalX = midpoint.x;
      let totalY = midpoint.y;
      let current: Element | null = target;

      while (current && current !== svg) {
        const transform = current.getAttribute('transform');
        if (transform) {
          const match = transform.match(
            /translate\((-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)\)/
          );
          if (match) {
            totalX += parseFloat(match[1]) || 0;
            totalY += parseFloat(match[2]) || 0;
          }
        }
        current = current.parentElement;
      }

      points.push({ x: totalX, y: totalY });
    }

    if (this.showAllGoals) {
      // نمایش تمام اهداف اصلی - هدف با بیشترین ساب‌گول در انتها
      await this.addAllMainGoals(svg, points);
    } else {
      // نمایش فقط ساب‌گول‌های هدف انتخاب شده
      await this.addOnlySubgoals(svg, points);
    }

    // اضافه کردن تصویر مرد
    await this.addManIcon(svg);

    this.cdr.detectChanges();
  }

  private async addAllMainGoals(svg: SVGSVGElement, points: { x: number; y: number }[]) {
    // جدا کردن هدف اصلی (با بیشترین ساب‌گول) از بقیه
    const otherGoals = this.goals.filter(goal => goal !== this.mainGoalWithMostSubgoals);
    const otherGoalsCount = otherGoals.length;

    // نمایش اهداف دیگر به طور مساوی
    for (let i = 0; i < otherGoalsCount; i++) {
      const goal = otherGoals[i];
      const pointIndex = Math.floor((i + 1) * (points.length / (otherGoalsCount + 2)));
      const pos = points[pointIndex];
      
      if (pos) {
        await this.addMainGoalIcon(svg, pos.x, pos.y, goal, i);
      }
    }

    // نمایش هدف اصلی با بیشترین ساب‌گول در انتهای مسیر
    const lastPos = points[points.length - 1];
    if (lastPos) {
      await this.addMainGoalIcon(svg, lastPos.x, lastPos.y, this.mainGoalWithMostSubgoals, otherGoalsCount);
    }
  }

  private async addOnlySubgoals(svg: SVGSVGElement, points: { x: number; y: number }[]) {
    if (!this.selectedGoal) return;

    const subgoals = this.selectedGoal.subgoal;
    const subCount = subgoals.length;

    console.log(`🎯 نمایش ${subCount} ساب‌گول برای هدف: ${this.selectedGoal.title}`);

    for (let i = 0; i < subCount; i++) {
      const sub = subgoals[i];
      
      let pointIndex: number;
      
      if (i === subCount - 1) {
        // آخرین ساب‌گول در انتهای مسیر
        pointIndex = points.length - 1;
      } else {
        // بقیه ساب‌گول‌ها به طور مساوی در طول مسیر تقسیم شوند
        pointIndex = Math.floor((i + 1) * (points.length / (subCount + 1)));
      }
      
      const pos = points[pointIndex];
      
      if (!pos) continue;

      // استفاده از آیکون متناسب با رنگ هدف اصلی
      const iconPath = this.getIconPathByColor(this.selectedGoal.color);
      await this.addSubgoalIcon(svg, pos.x, pos.y, iconPath, sub.name);
    }
  }

  private getIconPathByColor(color: string): string {
    return this.colorToIconMap[color] || 'assets/point1.svg'; // پیش‌فرض
  }

  private async addMainGoalIcon(svg: SVGSVGElement, x: number, y: number, goal: Goal, index: number) {
    try {
      // استفاده از آیکون متناسب با رنگ هدف
      const iconPath = this.getIconPathByColor(goal.color);
      const iconResponse = await fetch(iconPath);
      const iconText = await iconResponse.text();
      const parser = new DOMParser();
      const iconDoc = parser.parseFromString(iconText, 'image/svg+xml');
      const iconSvg = iconDoc.querySelector('svg');

      if (iconSvg) {
        iconSvg.setAttribute('x', (x - 22).toString());
        iconSvg.setAttribute('y', (y - 40).toString());
        iconSvg.setAttribute('width', '35');
        iconSvg.setAttribute('height', '30');
        iconSvg.classList.add('goal-marker');
        iconSvg.style.cursor = 'pointer';

        iconSvg.addEventListener('click', () => {
          this.onGoalClick(goal);
        });

        const importedNode = svg.ownerDocument.importNode(iconSvg, true);
        svg.appendChild(importedNode);

        // اضافه کردن تولتیپ با رنگ متناسب
        const tooltipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tooltipGroup.style.cursor = 'pointer';

        const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tooltipBg.setAttribute('x', (x - 30).toString());
        tooltipBg.setAttribute('y', (y - 70).toString());
        tooltipBg.setAttribute('width', '60');
        tooltipBg.setAttribute('height', '15');
        tooltipBg.setAttribute('rx', '10');
        tooltipBg.setAttribute('fill', '#fff');
        tooltipBg.setAttribute('stroke', goal.color); // استفاده از رنگ هدف
        tooltipBg.setAttribute('stroke-width', '2');
        tooltipBg.setAttribute('opacity', '0.95');
        tooltipBg.style.cursor = 'pointer';

        const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tooltipText.setAttribute('x', (x - 12).toString());
        tooltipText.setAttribute('y', (y - 58).toString());
        tooltipText.setAttribute('fill', '#333');
        tooltipText.setAttribute('font-size', '10');
        tooltipText.setAttribute('font-weight', 'bold');
        tooltipText.textContent = goal.title;
        tooltipText.style.cursor = 'pointer';

        tooltipGroup.addEventListener('click', () => {
          this.onGoalClick(goal);
        });

        tooltipGroup.appendChild(tooltipBg);
        tooltipGroup.appendChild(tooltipText);
        svg.appendChild(tooltipGroup);
      }
    } catch (err) {
      console.error('❌ خطا در لود هدف اصلی:', err);
    }
  }

  private onGoalClick(goal: Goal) {
    console.log(`🎯 کلیک روی هدف: ${goal.title} با ${goal.subgoal.length} ساب‌گول`);
    this.selectedGoal = goal;
    this.showAllGoals = false;
    localStorage.setItem('selectedGoalTitle', goal.title);
    this.loadSvgAndGeneratePoints();
  }

  private async addSubgoalIcon(
    svg: SVGSVGElement,
    x: number,
    y: number,
    iconPath: string,
    title: string
  ) {
    try {
      const iconResponse = await fetch(iconPath);
      const iconText = await iconResponse.text();
      const parser = new DOMParser();
      const iconDoc = parser.parseFromString(iconText, 'image/svg+xml');
      const iconSvgOriginal = iconDoc.querySelector('svg');

      if (iconSvgOriginal) {
        const iconSvg = svg.ownerDocument.importNode(iconSvgOriginal, true) as SVGSVGElement;

        iconSvg.setAttribute('x', (x - 15).toString());
        iconSvg.setAttribute('y', (y - 40).toString());
        iconSvg.setAttribute('width', '35');
        iconSvg.setAttribute('height', '30');
        iconSvg.classList.add('goal-marker', 'subgoal-marker');
        
        svg.appendChild(iconSvg);
      }
    } catch (err) {
      console.error('❌ خطا در لود آیکون ساب‌گول:', err);
    }
  }

  private async addManIcon(svg: SVGSVGElement) {
    try {
      const targetPath = svg.querySelector('#Path_3580') as SVGPathElement | null;
      if (!targetPath) return;

      const pathLength = targetPath.getTotalLength();
      const midpoint = targetPath.getPointAtLength(pathLength / 2);
      let totalX = midpoint.x;
      let totalY = midpoint.y;
      let current: Element | null = targetPath;

      while (current && current !== svg) {
        const transform = current.getAttribute('transform');
        if (transform) {
          const match = transform.match(
            /translate\((-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)\)/
          );
          if (match) {
            totalX += parseFloat(match[1]) || 0;
            totalY += parseFloat(match[2]) || 0;
          }
        }
        current = current.parentElement;
      }

      const manResponse = await fetch('assets/man2.svg');
      const manSvgText = await manResponse.text();
      const parser = new DOMParser();
      const manDoc = parser.parseFromString(manSvgText, 'image/svg+xml');
      const manSvg = manDoc.querySelector('svg');

      if (manSvg) {
        manSvg.setAttribute('x', (totalX - 12).toString());
        manSvg.setAttribute('y', (totalY - 90).toString());
        manSvg.setAttribute('width', '50');
        manSvg.setAttribute('height', '90');
        manSvg.classList.add('man-icon');
        const importedNode = svg.ownerDocument.importNode(manSvg, true);
        svg.appendChild(importedNode);
      }
    } catch (err) {
      console.error('❌ خطا در لود man2.svg:', err);
    }
  }

  // متد برای بازگشت به نمایش تمام اهداف
  showAllGoalsView() {
    this.showAllGoals = true;
    this.selectedGoal = null;
    localStorage.removeItem('selectedGoalTitle');
    this.loadSvgAndGeneratePoints();
  }
}