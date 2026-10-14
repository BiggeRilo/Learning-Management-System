import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { studentGuard } from './core/guards/student.guard';
import { MainLayout } from './core/layout/main-layout';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((m) => m.Login), title: 'Entrar' },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
    title: 'Criar conta',
  },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'courses' },
      {
        path: 'courses',
        loadComponent: () => import('./features/courses/course-list/course-list').then((m) => m.CourseList),
        title: 'Cursos',
      },
      {
        path: 'courses/:id',
        loadComponent: () => import('./features/courses/course-detail/course-detail').then((m) => m.CourseDetail),
        title: 'Detalhes do curso',
      },
      {
        path: 'my-courses',
        loadComponent: () => import('./features/enrollments/my-courses/my-courses').then((m) => m.MyCourses),
        canActivate: [authGuard, studentGuard],
        title: 'Meus cursos',
      },
      {
        path: 'my-courses/:id/logs',
        loadComponent: () => import('./features/enrollments/course-logs/course-logs').then((m) => m.CourseLogs),
        canActivate: [authGuard, studentGuard],
        title: 'Tarefas do curso',
      },
      {
        path: 'admin/courses',
        loadComponent: () => import('./features/courses/admin-courses/admin-courses').then((m) => m.AdminCourses),
        canActivate: [authGuard, adminGuard],
        title: 'Administrar cursos',
      },
      { path: '**', redirectTo: 'courses' },
    ],
  },
];
