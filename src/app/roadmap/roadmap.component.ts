import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Goal } from '../data.service';

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
  paintIcons = [
    'assets/point1.svg',
    'assets/point2.svg',
    'assets/point3.svg',
    'assets/point4.svg',
  ];

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  async ngAfterViewInit() {
    this.dataService.getGoals().subscribe(async (goals) => {
      this.goals = goals;
      await this.loadSvgAndGeneratePoints();
    });
  }

  async loadSvgAndGeneratePoints() {
    const container = this.svgContainer.nativeElement;
    container.innerHTML = '';

    const svgResponse = await fetch('assets/street (1).svg');
    const svgText = await svgResponse.text();
    container.innerHTML = svgText;

    const svg = container.querySelector('svg') as SVGSVGElement | null;
    if (!svg) {
      console.error('❌ SVG not found!');
      return;
    }

    // تنظیم استایل کلی SVG
    svg.removeAttribute('x');
    svg.removeAttribute('y');
    svg.removeAttribute('transform');
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';

    // پاکسازی نقاط قبلی
    svg.querySelectorAll('.point-marker, .goal-marker, .goal-text').forEach((el) => el.remove());

    const points: { x: number; y: number }[] = [];

    // 🔴 رسم نقاط قرمز
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

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', totalX.toString());
      circle.setAttribute('cy', totalY.toString());
      circle.setAttribute('r', '2');
      circle.setAttribute('fill', 'red');
      circle.classList.add('point-marker');
      svg.appendChild(circle);
    }

    // 🎯 هدف اصلی
    const mainGoal = this.goals.find((g) => g.title === 'هدف اصلی');
    if (!mainGoal || !(mainGoal as any).subgoal) return;
    const subgoals = (mainGoal as any).subgoal;
    const subCount = subgoals.length;

    // 📍 قرار دادن ساب‌هدف‌ها روی نقشه
    for (let i = 0; i < subCount; i++) {
      const ratio = (i + 1) / (subCount + 1);
      let pointIndex = Math.floor(ratio * this.totalPoints);
      if (pointIndex >= this.totalPoints) pointIndex = this.totalPoints - 1;

      const pos = points[pointIndex];
      if (!pos) continue;

      const randomIcon =
        this.paintIcons[Math.floor(Math.random() * this.paintIcons.length)];

      await this.addGoalIcon(svg, pos.x, pos.y, randomIcon, subgoals[i].name);
    }

    // 🎯 هدف اصلی روی آخرین نقطه + تولتیپ ثابت
    const lastPos = points.length > 0 ? points[points.length - 1] : null;
    if (lastPos) {
      try {
        const iconResponse = await fetch('assets/point1.svg');
        const iconText = await iconResponse.text();
        const parser = new DOMParser();
        const iconDoc = parser.parseFromString(iconText, 'image/svg+xml');
        const iconSvg = iconDoc.querySelector('svg');

        if (iconSvg) {
          iconSvg.setAttribute('x', (lastPos.x - 22).toString());
          iconSvg.setAttribute('y', (lastPos.y - 40).toString());
          iconSvg.setAttribute('width', '35');
          iconSvg.setAttribute('height', '30');
          iconSvg.classList.add('goal-marker');

          const importedNode = svg.ownerDocument.importNode(iconSvg, true);
          svg.appendChild(importedNode);

          // 🏷 تولتیپ ثابت بالای هدف اصلی
          const tooltipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

          const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          tooltipBg.setAttribute('x', (lastPos.x - 40).toString());
          tooltipBg.setAttribute('y', (lastPos.y - 70).toString());
          tooltipBg.setAttribute('width', '90');
          tooltipBg.setAttribute('height', '26');
          tooltipBg.setAttribute('rx', '8');
          tooltipBg.setAttribute('fill', '#fff');
          tooltipBg.setAttribute('stroke', '#FF7E7E');
          tooltipBg.setAttribute('stroke-width', '1.5');
          tooltipBg.setAttribute('opacity', '0.95');

          const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          tooltipText.setAttribute('x', (lastPos.x - 25).toString());
          tooltipText.setAttribute('y', (lastPos.y - 50).toString());
          tooltipText.setAttribute('fill', '#333');
          tooltipText.setAttribute('font-size', '12');
          tooltipText.setAttribute('font-weight', 'bold');
          tooltipText.textContent = mainGoal.title;

          tooltipGroup.appendChild(tooltipBg);
          tooltipGroup.appendChild(tooltipText);
          svg.appendChild(tooltipGroup);
        }
      } catch (err) {
        console.error('❌ خطا در لود هدف اصلی:', err);
      }
    }

    // 👨 man2.svg و نقطه خاص
    const targetPath = svg.querySelector('#Path_3580') as SVGPathElement | null;
    if (targetPath) {
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

      try {
        const manResponse = await fetch('assets/man2.svg');
        const manSvgText = await manResponse.text();
        const parser = new DOMParser();
        const manDoc = parser.parseFromString(manSvgText, 'image/svg+xml');
        const manSvg = manDoc.querySelector('svg');

        if (manSvg) {
          manSvg.setAttribute('x', (totalX - 12).toString());
          manSvg.setAttribute('y', (totalY - 80).toString());
          manSvg.setAttribute('width', '50');
          manSvg.setAttribute('height', '80');
          manSvg.classList.add('man-icon');
          const importedNode = svg.ownerDocument.importNode(manSvg, true);
          svg.appendChild(importedNode);
        }

        const circleToMove = svg.querySelector(
          'circle[cx="480.36301586914067"][cy="27.838805572509763"]'
        ) as SVGCircleElement | null;
        if (circleToMove) {
          circleToMove.setAttribute('cx', '355.36301586914067');
          circleToMove.setAttribute('cy', '58.838805572509763');
        }
      } catch (err) {
        console.error('❌ خطا در لود man2.svg:', err);
      }
    }

    this.cdr.detectChanges();
  }

  private async addGoalIcon(svg: SVGSVGElement, x: number, y: number, iconPath: string, title: string) {
    try {
      const iconResponse = await fetch(iconPath);
      const iconText = await iconResponse.text();
      const parser = new DOMParser();
      const iconDoc = parser.parseFromString(iconText, 'image/svg+xml');
      const iconSvg = iconDoc.querySelector('svg');

      if (iconSvg) {
        iconSvg.setAttribute('x', (x - 15).toString());
        iconSvg.setAttribute('y', (y - 40).toString());
        iconSvg.setAttribute('width', '15');
        iconSvg.setAttribute('height', '35');
        iconSvg.classList.add('goal-marker');

        const importedNode = svg.ownerDocument.importNode(iconSvg, true);
        svg.appendChild(importedNode);

        // متن کنار آیکون
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (x + 10).toString());
        text.setAttribute('y', (y + 5).toString());
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#333');
        text.textContent = title;
        text.classList.add('goal-text');
        svg.appendChild(text);
      }
    } catch (err) {
      console.error('❌ خطا در لود آیکون هدف:', err);
    }
  }
}
