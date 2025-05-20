export class CreateQuestionDto {
  title: string;
  answers: string[];
  correctAnswer: number;
  lessonId: number;
}
