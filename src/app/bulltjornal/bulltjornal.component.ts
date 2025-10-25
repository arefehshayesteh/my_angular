import { Component } from '@angular/core';
import { RoadmapComponent } from "../roadmap/roadmap.component";
import { PlanningComponent } from "../planning/planning.component";
import { CoursesComponent } from "../courses/courses.component";


@Component({
  selector: 'app-bulltjornal',
  standalone: true,
  imports: [RoadmapComponent, PlanningComponent, CoursesComponent],
  templateUrl: './bulltjornal.component.html',
  styleUrl: './bulltjornal.component.scss'
})
export class BulltjornalComponent {

}
