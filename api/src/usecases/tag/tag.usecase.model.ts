import { VisibilityValue } from '@src/common/visibility.enum';

export interface TagUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: VisibilityValue;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
