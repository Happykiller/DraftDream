// src\components\Input.tsx
import React from 'react';
import { Trans } from 'react-i18next';
import {
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Box,
  Fade,
  useTheme,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'onChange'> {
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  regex?: string;
  entity: {
    value: string;
    valid: boolean;
  };
  startIcon?: React.ReactNode;
  onChange?: (entity: { value: string; valid: boolean }) => void;
  require?: boolean;
  virgin?: boolean;
  icons?: {
    visibility?: React.ReactNode;
    visibilityOff?: React.ReactNode;
    help?: React.ReactNode;
  };
  endActions?: {
    icon: React.ReactNode;
    title?: string;
    onClick: () => void;
    disabled?: boolean;
    hide?: boolean;
  }[];
}

export const Input: React.FC<InputProps> = ({
  label,
  tooltip,
  regex,
  entity,
  startIcon,
  onChange,
  require = false,
  virgin: virginProp = false,
  type = 'text',
  icons = {},
  endActions = [],
  ...rest
}) => {
  const theme = useTheme();
  const [state, setState] = React.useState(entity);
  const [passVisible, setPassVisible] = React.useState(false);
  const [virgin, setVirgin] = React.useState(virginProp);
  const isPassword = type === 'password';

  const fullLabel = (
    <>
      {label}
      {require && '*'}
    </>
  );

  React.useEffect(() => {
    setState(entity);
  }, [entity.value, entity.valid]);

  const calcValid = (value: string): boolean => {
    const v = value.trim();
    if (require && v.length === 0) return false;
    if (regex && v.length !== 0) {
      const reg = new RegExp(regex);
      return reg.test(v);
    }
    return true;
  };

  const giveHelper = () => {
    if (!virgin && require && !state.valid) {
      return <Trans>common.field_incorrect</Trans>;
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVirgin(false);
    const newValue = e.target.value;
    const isValid = calcValid(newValue);
    setState({ value: newValue, valid: isValid });
    onChange?.({ value: newValue, valid: isValid });
  };

  const renderEndAdornment = () => (
    <InputAdornment position="end">
      <Box display="flex" alignItems="center" gap={0.5}>
        {isPassword && (
          <IconButton
            onClick={() => setPassVisible((prev) => !prev)}
            edge="end"
            size="small"
            sx={{ color: theme.palette.text.secondary }}
          >
            {passVisible ? icons.visibilityOff : icons.visibility}
          </IconButton>
        )}
        {tooltip && (
          <Tooltip
            title={tooltip}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 300 }}
          >
            <IconButton
              edge="end"
              size="small"
              sx={{ color: theme.palette.text.secondary }}>
              {icons.help}
            </IconButton>
          </Tooltip>
        )}
        {endActions?.map((action, idx) =>
          action.hide ? null : (
            <Tooltip key={idx} title={action.title ?? ''}>
              <IconButton
                size="small"
                edge="end"
                onClick={action.onClick}
                disabled={action.disabled}
                sx={{ color: theme.palette.text.secondary }}
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          )
        )}
      </Box>
    </InputAdornment>
  );

  return (
    <TextField
      {...rest}
      fullWidth
      autoComplete="off"
      variant="outlined"
      label={fullLabel}
      type={isPassword ? (passVisible ? 'text' : 'password') : type}
      error={!virgin && !state.valid}
      value={state.value}
      helperText={giveHelper()}
      onChange={handleChange}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment
            position="start"
            sx={{ color: theme.palette.text.secondary }}
          >
            {startIcon}
          </InputAdornment>
        ) : undefined,
        endAdornment: renderEndAdornment(),
      }}
      sx={{
        '.MuiOutlinedInput-root': {
          backgroundColor: theme.palette.background.paper,
          borderRadius: `${theme.shape.borderRadius}px`,
          transition: 'all 0.2s ease-in-out',
          '& fieldset': {
            borderColor: theme.palette.divider,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.light,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
          },
          '&.Mui-error fieldset': {
            borderColor: theme.palette.error.main,
          },
        },
        input: {
          color: theme.palette.text.primary,
          backgroundColor: 'transparent',
          py: 1.2,
        },
      }}
    />
  );
};
