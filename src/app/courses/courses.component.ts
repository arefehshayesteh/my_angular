
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})

export class CoursesComponent {
  courses = [
    {
      teacher: 'مهندس علی رضایی',
      desc: ' یادگیری روش‌های علمی برای افزایش بهره‌وری شخصیی',
      students: 1250,
      rating: 5,
      discount: 50,
    },
    {
      teacher: 'مهندس علی رضایی',
      desc: 'افزایش تمرکز، نظم ذهنی و بهره‌وری با تکنیک‌های عملی',
      students: 1250,
      rating: 4,
      discount: 50,
    },
    {
      teacher: 'مهندس علی رضایی',
      desc: 'برنامه‌ریزی هوشمند برای استفاده بهتر از زمان در پروژه‌ها',
      students: 1250,
      rating: 5,
      discount: 50,
    },
    {
      teacher: 'مهندس علی رضایی',
      desc: 'برنامه‌ریزی هوشمند برای استفاده بهتر از زمان در پروژه‌ها',
      students: 1250,
      rating: 5,
      discount: 50,
    }
  ];
  
}
