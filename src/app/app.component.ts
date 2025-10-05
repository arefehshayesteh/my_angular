import { Component } from '@angular/core';
import { CoursesComponent } from './courses/courses.component';
import { RouterModule } from '@angular/router';
// import { AppRoutingModule } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CoursesComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
