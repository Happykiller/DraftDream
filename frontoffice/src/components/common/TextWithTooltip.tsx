import * as React from 'react';
import { Tooltip, Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';
import type { TooltipProps } from '@mui/material/Tooltip';

export interface TextWithTooltipProps extends TypographyProps {
    /** The full text to display in the tooltip */
    tooltipTitle: string;
    /** Optional props for the Tooltip component */
    tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
}

export function TextWithTooltip({
    tooltipTitle,
    tooltipProps,
    children,
    ...typographyProps
}: TextWithTooltipProps): React.JSX.Element {
    const textRef = React.useRef<HTMLElement | null>(null);

    return (
        <Tooltip title={tooltipTitle}>
            <Typography
                ref={textRef}
                noWrap
                sx={{
                    ...typographyProps.sx,
                }}
            >
                {children ?? tooltipTitle}
            </Typography>
        </Tooltip>
    );
}
