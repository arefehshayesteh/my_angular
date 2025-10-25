import { Component } from '@angular/core';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { PlanningComponent } from './planning/planning.component';
import { CoursesComponent } from './courses/courses.component';
import { BulltjornalComponent } from "./bulltjornal/bulltjornal.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RoadmapComponent, PlanningComponent, CoursesComponent, BulltjornalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
