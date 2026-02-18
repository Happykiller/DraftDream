import * as React from 'react';

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import {
    AccessibilityNew as PainIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { useAsyncTask } from '@hooks/useAsyncTask';

type AnatomyView = 'front' | 'back';

type PainZonesSelectorProps = {
    value: string[];
    onChange?: (zones: string[]) => void;
    readOnly?: boolean;
};

const ANATOMY_FILES: Record<AnatomyView, string> = {
    front: '/anatomy_front.svg',
    back: '/anatomy_back.svg',
};


/**
 * Formats a zone identifier into a readable fallback label.
 */
const formatZoneIdLabel = (zoneId: string): string => (
    zoneId
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
);

/**
 * Cleans SVG markup exported with namespace prefixes so it can be injected safely in JSX.
 */
const normalizeSvgMarkup = (markup: string): string => (
    markup
        .replaceAll('ns0:', '')
        .replace(/xmlns:ns0="[^"]+"/g, '')
);

/**
 * Interactive body map for selecting pain areas on front and back anatomy diagrams.
 */
export function PainZonesSelector({ value, onChange, readOnly = false }: PainZonesSelectorProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const { execute } = useAsyncTask();

    const [activeView, setActiveView] = React.useState<AnatomyView>('front');
    const [anatomySvgMap, setAnatomySvgMap] = React.useState<Record<AnatomyView, string>>({
        front: '',
        back: '',
    });
    const [loadError, setLoadError] = React.useState<boolean>(false);

    React.useEffect(() => {
        void execute(async () => {
            try {
                const [frontMarkup, backMarkup] = await Promise.all([
                    fetch(ANATOMY_FILES.front).then(async (response) => {
                        if (!response.ok) {
                            throw new Error(`Failed to load ${ANATOMY_FILES.front}`);
                        }
                        return await response.text();
                    }),
                    fetch(ANATOMY_FILES.back).then(async (response) => {
                        if (!response.ok) {
                            throw new Error(`Failed to load ${ANATOMY_FILES.back}`);
                        }
                        return await response.text();
                    }),
                ]);

                setAnatomySvgMap({
                    front: normalizeSvgMarkup(frontMarkup),
                    back: normalizeSvgMarkup(backMarkup),
                });
                setLoadError(false);
            } catch (error) {
                setLoadError(true);
                console.error('Failed to load anatomy SVG files', error);
            }
        });
    }, [execute]);

    const anatomyMarkup = React.useMemo(() => {
        const rawMarkup = anatomySvgMap[activeView];
        if (!rawMarkup) {
            return '';
        }

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(rawMarkup, 'image/svg+xml');
        const svgNode = svgDoc.documentElement;

        svgNode.setAttribute('class', 'anatomy-svg');

        svgNode.querySelectorAll('path[id]').forEach((path) => {
            const zoneId = path.getAttribute('id');
            const isSelected = zoneId ? value.includes(zoneId) : false;

            path.setAttribute('data-zone-id', zoneId ?? '');
            path.setAttribute('data-selected', isSelected ? 'true' : 'false');
            path.setAttribute('fill', isSelected ? '#ef5350' : 'transparent');
            path.setAttribute('cursor', readOnly ? 'default' : 'pointer');
        });

        return svgNode.outerHTML;
    }, [activeView, anatomySvgMap, readOnly, value]);

    const getZoneLabel = React.useCallback((zoneId: string): string => {
        const translationKey = `daily_report.sections.pain.zones.${zoneId}`;
        if (i18n.exists(translationKey)) {
            return t(translationKey);
        }

        return formatZoneIdLabel(zoneId);
    }, [i18n, t]);

    const toggleZone = React.useCallback((zoneId: string) => {
        if (readOnly || !onChange) {
            return;
        }

        const hasZone = value.includes(zoneId);

        if (hasZone) {
            onChange(value.filter((id) => id !== zoneId));
            return;
        }

        onChange([...value, zoneId]);
    }, [onChange, readOnly, value]);

    const handleMapClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (readOnly) {
            return;
        }

        const target = event.target as Element;
        const path = target.closest('path[data-zone-id]');
        const zoneId = path?.getAttribute('data-zone-id');

        if (!zoneId) {
            return;
        }

        toggleZone(zoneId);
    }, [readOnly, toggleZone]);

    if (loadError) {
        return <Alert severity="error">{t('daily_report.sections.pain.load_error')}</Alert>;
    }

    if (!anatomySvgMap.front || !anatomySvgMap.back) {
        return (
            <Stack direction="row" spacing={1.5} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2">{t('daily_report.sections.pain.loading')}</Typography>
            </Stack>
        );
    }

    return (
        <Stack spacing={2.5}>
            {/* General information */}
            <Stack direction="row" spacing={1.5} alignItems="center">
                <PainIcon color="error" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                    {t('daily_report.sections.pain.helper')}
                </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
                <Button
                    variant={activeView === 'front' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => setActiveView('front')}
                >
                    {t('daily_report.sections.pain.views.front')}
                </Button>
                <Button
                    variant={activeView === 'back' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => setActiveView('back')}
                >
                    {t('daily_report.sections.pain.views.back')}
                </Button>
            </Stack>

            <Box
                onClick={readOnly ? undefined : handleMapClick}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    bgcolor: 'background.paper',
                    '& .anatomy-svg': {
                        width: '100%',
                        maxWidth: 340,
                        height: 'auto',
                        display: 'block',
                        mx: 'auto',
                    },
                    '& .anatomy-svg path[id]': {
                        transition: 'fill 0.2s ease, opacity 0.2s ease',
                    },
                    ...(readOnly ? {} : {
                        '& .anatomy-svg path[id]:hover': {
                            fill: 'rgba(239, 83, 80, 0.3)',
                        },
                    }),
                    '& .anatomy-svg path[data-selected="true"]': {
                        fill: '#ef5350',
                    },
                }}
                dangerouslySetInnerHTML={{ __html: anatomyMarkup }}
            />

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {value.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                        {t('daily_report.sections.pain.empty')}
                    </Typography>
                ) : (
                    value.map((zoneId) => (
                        <Chip
                            key={zoneId}
                            label={getZoneLabel(zoneId)}
                            color="error"
                            variant="outlined"
                            onDelete={readOnly ? undefined : () => toggleZone(zoneId)}
                        />
                    ))
                )}
            </Stack>
        </Stack>
    );
}
