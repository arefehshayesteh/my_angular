import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Point {
  id: number;
  label: string;
  x: number;
  y: number;
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

  points: Point[] = [];
  hoveredPoint: Point | null = null;

  constructor(private cd: ChangeDetectorRef) {}

  async ngAfterViewInit() {
    const response = await fetch('assets/road.svg');
    const svgText = await response.text();
    this.svgContainer.nativeElement.innerHTML = svgText;

    const path = this.svgContainer.nativeElement.querySelector('#roadPath') as SVGPathElement | null;
    if (!path) {
      console.error('مسیر roadPath پیدا نشد');
      return;
    }

    const pathLength = path.getTotalLength();
    const numPoints = 20; // ← تعداد دلخواه توپ‌ها

    const newPoints: Point[] = [];
    for (let i = 1; i <= numPoints; i++) {
      const pt = path.getPointAtLength((i / (numPoints + 1)) * pathLength);
      newPoints.push({
        id: i,
        label: `مرحله ${i}`,
        x: pt.x,
        y: pt.y
      });
    }

    this.points = newPoints;
    this.cd.detectChanges();
  }
}
