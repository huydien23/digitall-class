import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Box,
  Chip,
  OutlinedInput
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

// Enhanced TextField with validation
export const ValidatedTextField = ({
  name,
  control,
  label,
  rules = {},
  type = 'text',
  multiline = false,
  rows = 4,
  disabled = false,
  placeholder,
  startAdornment,
  endAdornment,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          multiline={multiline}
          rows={multiline ? rows : undefined}
          disabled={disabled}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message}
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment,
            endAdornment,
          }}
          {...props}
        />
      )}
    />
  )
}

// Enhanced Select with validation
export const ValidatedSelect = ({
  name,
  control,
  label,
  options = [],
  rules = {},
  disabled = false,
  multiple = false,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error} disabled={disabled}>
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            label={label}
            multiple={multiple}
            renderValue={multiple ? (selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const option = options.find(opt => opt.value === value)
                  return (
                    <Chip 
                      key={value} 
                      label={option?.label || value} 
                      size="small" 
                    />
                  )
                })}
              </Box>
            ) : undefined}
            input={multiple ? <OutlinedInput label={label} /> : undefined}
            {...props}
          >
            {options.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}

// Enhanced DatePicker with validation
export const ValidatedDatePicker = ({
  name,
  control,
  label,
  rules = {},
  disabled = false,
  minDate,
  maxDate,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...field}
          label={label}
          disabled={disabled}
          minDate={minDate ? dayjs(minDate) : undefined}
          maxDate={maxDate ? dayjs(maxDate) : undefined}
          value={field.value ? dayjs(field.value) : null}
          onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              error={!!error}
              helperText={error?.message}
            />
          )}
          {...props}
        />
      )}
    />
  )
}

// Enhanced Checkbox with validation
export const ValidatedCheckbox = ({
  name,
  control,
  label,
  rules = {},
  disabled = false,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} disabled={disabled}>
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={!!field.value}
                disabled={disabled}
                {...props}
              />
            }
            label={label}
          />
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}

// Enhanced RadioGroup with validation
export const ValidatedRadioGroup = ({
  name,
  control,
  label,
  options = [],
  rules = {},
  disabled = false,
  row = false,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset" error={!!error} disabled={disabled}>
          <FormLabel component="legend">{label}</FormLabel>
          <RadioGroup
            {...field}
            row={row}
            {...props}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                disabled={option.disabled || disabled}
              />
            ))}
          </RadioGroup>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}

// Enhanced Switch with validation
export const ValidatedSwitch = ({
  name,
  control,
  label,
  rules = {},
  disabled = false,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} disabled={disabled}>
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={!!field.value}
                disabled={disabled}
                {...props}
              />
            }
            label={label}
          />
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}

// Custom hook for form with enhanced features
export const useEnhancedForm = (schema, defaultValues = {}) => {
  const form = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues,
    mode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
    setValue,
    getValues,
    watch,
    trigger
  } = form

  return {
    ...form,
    control,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    trigger,
    // Enhanced submit handler with error handling
    handleFormSubmit: (onSubmit, onError) => 
      handleSubmit(onSubmit, onError || ((errors) => console.error('Form errors:', errors)))
  }
}

export default {
  ValidatedTextField,
  ValidatedSelect,
  ValidatedDatePicker,
  ValidatedCheckbox,
  ValidatedRadioGroup,
  ValidatedSwitch,
  useEnhancedForm
}
