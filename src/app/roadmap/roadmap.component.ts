import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface RoadItem {
  title: string;
  description: string;
}

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

  data: RoadItem[] = [
    { title: 'شروع پروژه', description: 'تحلیل نیازمندی‌ها' },
    { title: 'طراحی اولیه', description: 'ساخت وایرفریم و UI' },
    { title: 'توسعه', description: 'کدنویسی و پیاده‌سازی' },
    { title: 'تست', description: 'بررسی و رفع باگ‌ها' },
   
  ];

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
    const numPoints = this.data.length;

    const newPoints: Point[] = [];
    for (let i = 0; i < numPoints; i++) {
      const pt = path.getPointAtLength(((i + 1) / (numPoints + 1)) * pathLength);
      const percent = Math.round(((i + 1) / numPoints) * 100);

      newPoints.push({
        id: i + 1,
        label: `${this.data[i].title} - ${percent}%`,
        x: pt.x,
        y: pt.y
      });
    }

    this.points = newPoints;
    this.cd.detectChanges();
  }
}
