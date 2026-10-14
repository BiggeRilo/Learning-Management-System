import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Course, CourseInput } from '../../shared/models/course';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);

  list(): Observable<Course[]> {
    return this.http.get<Course[]>(`${environment.apiUrl}/courses`);
  }

  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${environment.apiUrl}/courses/${id}`);
  }

  create(input: CourseInput): Observable<Course> {
    return this.http.post<Course>(`${environment.apiUrl}/courses`, input);
  }

  update(id: number, input: CourseInput): Observable<Course> {
    return this.http.put<Course>(`${environment.apiUrl}/courses/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/courses/${id}`);
  }
}
