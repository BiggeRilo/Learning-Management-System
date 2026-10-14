export interface Course {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface CourseInput {
  name: string;
  description: string;
}
