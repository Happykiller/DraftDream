import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const showcaseRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(showcaseRoot, '..');

const CHANGELOG_PATHS = {
  global: path.join(repositoryRoot, 'CHANGELOG.md'),
  '/api': path.join(repositoryRoot, 'api', 'CHANGELOG.md'),
  '/backoffice': path.join(repositoryRoot, 'backoffice', 'CHANGELOG.md'),
  '/frontoffice': path.join(repositoryRoot, 'frontoffice', 'CHANGELOG.md')
};

const OUTPUT_LANGUAGES = ['en', 'fr'];

const OUTPUT_DIR = path.join(showcaseRoot, 'public', 'i18n');

const headingPattern = /^##\s*\[(?<version>[^\]]+)\]\s*-\s*(?<date>\d{4}-\d{2}-\d{2})\s*$/;

const parseChangelog = (rawContent) => {
  const lines = rawContent.split(/\r?\n/);
  const releases = [];
  let currentRelease = null;

  lines.forEach((line) => {
    const headingMatch = line.match(headingPattern);

    if (headingMatch) {
      if (currentRelease) {
        releases.push(currentRelease);
      }

      currentRelease = {
        date: headingMatch.groups.date,
        items: [],
        version: headingMatch.groups.version
      };

      return;
    }

    if (!currentRelease) {
      return;
    }

    if (line.trim().startsWith('- ')) {
      currentRelease.items.push(line.trim().slice(2));
    }
  });

  if (currentRelease) {
    releases.push(currentRelease);
  }

  return releases;
};

const byDateDescending = (first, second) => {
  const firstTime = Date.parse(first.date);
  const secondTime = Date.parse(second.date);

  return secondTime - firstTime;
};

const loadChangelog = async (filePath) => {
  try {
    const content = await readFile(filePath, 'utf8');

    return parseChangelog(content);
  } catch (error) {
    console.warn(`Could not read changelog at ${filePath}:`, error);

    return [];
  }
};

const selectProjectItems = (projectReleases, targetDate) => {
  const targetTime = Date.parse(targetDate);
  const matchingRelease = projectReleases.find((entry) => Date.parse(entry.date) <= targetTime);

  return matchingRelease?.items ?? [];
};

const buildReleaseDataset = async () => {
  const globalReleases = (await loadChangelog(CHANGELOG_PATHS.global)).sort(byDateDescending);

  const projectEntries = await Promise.all(
    Object.entries(CHANGELOG_PATHS)
      .filter(([key]) => key !== 'global')
      .map(async ([projectKey, projectPath]) => [projectKey, (await loadChangelog(projectPath)).sort(byDateDescending)])
  );

  const projectIndex = Object.fromEntries(projectEntries);

  return {
    releases: globalReleases.map((release) => ({
      date: release.date,
      global: release.items,
      notes: '',
      projects: Object.fromEntries(
        Object.entries(projectIndex).map(([projectKey, entries]) => [projectKey, selectProjectItems(entries, release.date)])
      ),
      title: `Release ${release.version}`,
      version: release.version
    }))
  };
};

const writeOutputs = async (dataset) => {
  await Promise.all(
    OUTPUT_LANGUAGES.map(async (language) => {
      const languageDirectory = path.join(OUTPUT_DIR, language);
      await mkdir(languageDirectory, { recursive: true });
      const filePath = path.join(languageDirectory, 'releases.json');

      await writeFile(filePath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
    })
  );
};

const main = async () => {
  const dataset = await buildReleaseDataset();
  await writeOutputs(dataset);
};

void main();
