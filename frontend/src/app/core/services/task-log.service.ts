import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { TaskLog, TaskLogInput } from '../../shared/models/task-log';

@Injectable({ providedIn: 'root' })
export class TaskLogService {
  private readonly http = inject(HttpClient);

  listByEnrollment(enrollmentId: number): Observable<TaskLog[]> {
    return this.http.get<TaskLog[]>(`${environment.apiUrl}/enrollments/${enrollmentId}/logs`);
  }

  create(enrollmentId: number, input: TaskLogInput): Observable<TaskLog> {
    return this.http.post<TaskLog>(`${environment.apiUrl}/enrollments/${enrollmentId}/logs`, input);
  }

  update(logId: number, input: TaskLogInput): Observable<TaskLog> {
    return this.http.put<TaskLog>(`${environment.apiUrl}/logs/${logId}`, input);
  }

  delete(logId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/logs/${logId}`);
  }
}
