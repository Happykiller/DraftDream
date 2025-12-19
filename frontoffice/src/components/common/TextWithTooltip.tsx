import * as React from 'react';
import { Tooltip, Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';
import type { TooltipProps } from '@mui/material/Tooltip';

export interface TextWithTooltipProps extends TypographyProps {
    /** The full text to display in the tooltip */
    tooltipTitle: string;
    /** Optional props for the Tooltip component */
    tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
    /** Maximum number of lines to display before truncation. If set, uses -webkit-line-clamp. */
    maxLines?: number;
}

export function TextWithTooltip({
    tooltipTitle,
    tooltipProps,
    maxLines,
    children,
    ...typographyProps
}: TextWithTooltipProps): React.JSX.Element {
    const textRef = React.useRef<HTMLElement | null>(null);
    const [isOverflowed, setIsOverflowed] = React.useState(false);

    React.useLayoutEffect(() => {
        const element = textRef.current;
        if (!element) {
            return;
        }

        const checkOverflow = () => {
            // Use a small tolerance for sub-pixel rendering differences which can cause false positives
            if (maxLines) {
                setIsOverflowed(element.scrollHeight > element.clientHeight + 1);
            } else {
                setIsOverflowed(element.scrollWidth > element.clientWidth + 1);
            }
        };

        checkOverflow();

        // Optional: Re-check on window resize if needed, though simple resize observer is better for robustness
        // For now, simple check on mount/update is usually enough for static layouts, but a ResizeObserver would be safer.
        const observer = new ResizeObserver(checkOverflow);
        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [children, tooltipTitle, maxLines, typographyProps.style, typographyProps.sx]);

    const lineClampSx = maxLines
        ? {
            display: '-webkit-box',
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
        }
        : {};

    const baseSx = {
        display: 'block',
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
    };

    return (
        <Tooltip title={isOverflowed ? tooltipTitle : ''} disableHoverListener={!isOverflowed} {...tooltipProps}>
            <Typography
                ref={textRef}
                noWrap={typographyProps.noWrap ?? !maxLines}
                {...typographyProps}
                sx={{
                    ...baseSx,
                    ...(lineClampSx as any),
                    ...typographyProps.sx,
                }}
            >
                {children ?? tooltipTitle}
            </Typography>
        </Tooltip>
    );
}
