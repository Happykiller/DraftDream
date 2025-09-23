// src\services\db\mongo\exercise\service.db.mongo.taxomomy.model.ts
export interface TaxonomyBase {
  _id: string;
  slug: string;
  locale: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Muscle extends TaxonomyBase {
  kind: 'muscle';
  parentId?: string;     // e.g., "dos" -> for grouping
}

export interface Equipment extends TaxonomyBase {
  kind: 'equipment';
}

export interface Category extends TaxonomyBase {
  kind: 'category';
}

export interface Tag extends TaxonomyBase {
  kind: 'tag';
}
