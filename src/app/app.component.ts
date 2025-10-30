import { Component } from '@angular/core';
import { RoadmapComponent } from './Products/bulltjornal/components/roadmap/roadmap.component';
import { PlanningComponent } from './Products/bulltjornal/components/planning/planning.component';
import { CoursesComponent } from './Products/bulltjornal/components/courses/courses.component';
import { BulltjornalComponent } from './Products/bulltjornal/bulltjornal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RoadmapComponent, PlanningComponent, CoursesComponent, BulltjornalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
