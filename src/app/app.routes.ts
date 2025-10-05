import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { CoursesComponent } from './courses/courses.component';

export const routes: Routes = [
  { path: '', component: CoursesComponent }
];

export const AppRoutingModule = provideRouter(routes);
