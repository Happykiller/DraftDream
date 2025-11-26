---
description: MUI DataGrid - Best practices for column rendering
---

# MUI DataGrid Column Rendering

## ⚠️ Important Rule: renderCell vs valueFormatter

When working with MUI DataGrid columns, **always use `renderCell` instead of `valueFormatter` when you need to access the actual field value for conditional rendering or transformation**.

### Why?

- **`valueFormatter`**: Receives different parameter structures depending on MUI version and may not give direct access to the field value
- **`renderCell`**: Always receives `params` object with consistent access to `params.value` or `params.row[fieldName]`

### ❌ Incorrect Pattern (causes bugs)

```typescript
{
  field: 'visibility',
  headerName: t('common.labels.visibility'),
  width: 140,
  valueFormatter: ({ value }) =>
    value === 'PUBLIC' ? t('common.visibility.public') : t('common.visibility.private'),
}
```

**Problem**: The `{ value }` destructuring may not work correctly depending on how `valueFormatter` passes parameters.

### ✅ Correct Pattern

```typescript
{
  field: 'visibility',
  headerName: t('common.labels.visibility'),
  width: 140,
  renderCell: ({ value }) =>
    value === 'PUBLIC' ? t('common.visibility.public') : t('common.visibility.private'),
}
```

**Or even more explicit**:

```typescript
{
  field: 'visibility',
  headerName: t('common.labels.visibility'),
  width: 140,
  renderCell: (params) => {
    const visibility = params.row.visibility;
    return visibility === 'PUBLIC' ? t('common.visibility.public') : t('common.visibility.private');
  },
}
```

## When to use each?

### Use `valueFormatter`
- For simple value transformations (numbers, dates)
- When you just need to format the raw value as a string
- Example: `valueFormatter: (value: any) => \`${value} kg\``

### Use `renderCell`
- For conditional rendering based on value
- When you need to return JSX/React components
- When you need access to the entire row object
- For complex transformations with i18n
- Example: Chips, Icons, conditional text, etc.

## Real-world Examples

### ✅ Simple formatting with valueFormatter
```typescript
{
  field: 'duration',
  headerName: t('common.labels.duration_weeks'),
  width: 150,
  valueFormatter: (value: any) => `${value} weeks`,
}
```

### ✅ Conditional rendering with renderCell
```typescript
{
  field: 'status',
  headerName: t('common.labels.status'),
  width: 120,
  renderCell: (params) => (
    <Chip
      label={params.value}
      color={params.value === 'ACTIVE' ? 'success' : 'default'}
    />
  ),
}
```

### ✅ Complex object access with renderCell
```typescript
{
  field: 'athlete',
  headerName: t('common.labels.athlete'),
  flex: 1,
  renderCell: (params) => params.row.athlete?.email ?? 'N/A',
}
```

## Common Bug Pattern

**Symptom**: Column shows wrong values or undefined
**Cause**: Using `valueFormatter` with destructuring `{ value }`
**Fix**: Change to `renderCell` with `params.value` or `params.row.fieldName`

---

**Reference**: Fixed in ProgramTable.tsx - visibility column was showing wrong values until changed from `valueFormatter` to `renderCell`.
