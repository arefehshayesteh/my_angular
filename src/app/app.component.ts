import { Component } from '@angular/core';
import { RoadmapComponent } from './roadmap/roadmap.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RoadmapComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
