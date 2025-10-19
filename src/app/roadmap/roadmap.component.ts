import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
})
export class RoadmapComponent implements AfterViewInit {
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngAfterViewInit() {
    await this.loadSvgAndGeneratePoints();
    window.addEventListener('resize', () => this.loadSvgAndGeneratePoints());
  }

  async loadSvgAndGeneratePoints() {
    const container = this.svgContainer.nativeElement;
    
    // پاک‌سازی محتوا
    container.innerHTML = '';
    
    const svgResponse = await fetch('assets/street (1).svg');
    const svgText = await svgResponse.text();
    container.innerHTML = svgText;
  
    const svg = container.querySelector('svg') as SVGSVGElement | null;
    if (!svg) {
      console.error('SVG not found!');
      return;
    }
  
    // حذف تمام attributeهای موقعیت‌دهی از SVG اصلی
    svg.removeAttribute('x');
    svg.removeAttribute('y');
    svg.removeAttribute('transform');
    
    // تنظیم استایل برای居中 سازی
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
  
    console.log('SVG loaded and centered');
    
    // بقیه کدهای شما...
   

    // حذف قبلی‌ها
    svg.querySelectorAll('.point-marker, .man-icon').forEach((el: Element) => el.remove());

    let firstPointCoords: { x: number; y: number } | null = null;

    // حلقه‌ی نقاط 1 تا 25
    for (let i = 1; i <= 25; i++) {
      const target = svg.querySelector(`[data-name="${i}"]`) as SVGPathElement | null;
      if (!target) continue;

      const pathLength = target.getTotalLength();
      const midpoint = target.getPointAtLength(pathLength / 2);

      // محاسبه‌ی transform والدها
      let totalX = midpoint.x;
      let totalY = midpoint.y;
      let current: Element | null = target;

      while (current && current !== svg) {
        const transform = current.getAttribute('transform');
        if (transform) {
          const match = transform.match(/translate\((-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)\)/);
          if (match) {
            totalX += parseFloat(match[1]) || 0;
            totalY += parseFloat(match[2]) || 0;
          }
        }
        current = current.parentElement;
      }

      if (i === 1) {
        firstPointCoords = { x: totalX, y: totalY };
      }

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', totalX.toString());
      circle.setAttribute('cy', totalY.toString());
      circle.setAttribute('r', '2');
      circle.setAttribute('fill', 'red');
      circle.classList.add('point-marker');
      svg.appendChild(circle);
    }

    // نقطه خاص تغییر مکان داده شود
    const circleToMove = svg.querySelector(
      'circle[cx="480.36301586914067"][cy="27.838805572509763"]'
    ) as SVGCircleElement | null;
    if (circleToMove) {
      circleToMove.setAttribute('cx', '355.36301586914067');
      circleToMove.setAttribute('cy', '58.838805572509763');
    }

    // 📌 درج man2.svg به صورت inline در نقطه اول
   // 📌 درج man2.svg روی مسیر Path_3580
const targetPath = svg.querySelector('#Path_3580') as SVGPathElement | null;
if (targetPath) {
  const pathLength = targetPath.getTotalLength();
  const midpoint = targetPath.getPointAtLength(pathLength / 2);

  // محاسبه transform مسیر
  let totalX = midpoint.x;
  let totalY = midpoint.y;
  let current: Element | null = targetPath;

  while (current && current !== svg) {
    const transform = current.getAttribute('transform');
    if (transform) {
      const match = transform.match(/translate\((-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)\)/);
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
      manSvg.setAttribute('width', '800');   // عرض دلخواه
      manSvg.setAttribute('height', '600');  // ارتفاع دلخواه
      
    }
    if (manSvg) {
      // مرکز مسیر
      manSvg.setAttribute('x', (totalX - 12).toString());
      manSvg.setAttribute('y', (totalY - 80).toString());
      manSvg.setAttribute('width', '50');
      manSvg.setAttribute('height', '80');
      manSvg.classList.add('man-icon');
      manSvg.width

      const importedNode = svg.ownerDocument.importNode(manSvg, true);
      svg.appendChild(importedNode);
    }
    
  } catch (err) {
    console.error('خطا در لود man2.svg:', err);
  }
}

this.cdr.detectChanges();
}
  }

