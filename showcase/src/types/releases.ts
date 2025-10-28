export type ReleaseProjects = Record<string, string[]>;

export type ReleaseEntry = {
  readonly date: string;
  readonly global: string[];
  readonly notes: string;
  readonly projects: ReleaseProjects;
  readonly title: string;
  readonly version: string;
};

export type ReleaseDataset = {
  readonly releases: ReleaseEntry[];
};
