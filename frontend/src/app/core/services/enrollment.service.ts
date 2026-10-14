import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Enrollment } from '../../shared/models/enrollment';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);

  myEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${environment.apiUrl}/students/me/enrollments`);
  }

  enroll(courseId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${environment.apiUrl}/enrollments`, { courseId });
  }
}
