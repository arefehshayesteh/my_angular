import { Component } from '@angular/core';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { PlanningComponent } from "./planning/planning.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RoadmapComponent, PlanningComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
