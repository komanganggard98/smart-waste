import Select, { Theme } from 'react-select'
const globalTheme = (theme:Theme) => ({
  ...theme,
  borderRadius: 6,
  colors: {
    ...theme.colors,
    primary: 'var(--brand-primary)',
    primary25: 'var(--brand-primary-soft)',
    neutral0: 'var(--background)',
    neutral80: 'var(--foreground)',
    neutral50: 'var(--muted-foreground)',
  },
});

const globalStyles = {
  control: (provided:any, state:any) => ({
    ...provided,
    minHeight: '38px',
    borderRadius: '0.375rem',
    borderColor: state.isFocused ? 'var(--brand-primary)' : '#e2e8f0 ',
    boxShadow: state.isFocused ? '0 0 0 3px var(--brand-primary-soft)' : 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
    '&:hover': {
      borderColor: 'var(--brand-primary)',
    },
    fontSize: 13,
  }),
  option: (provided:any, state:any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'var(--brand-primary)'
      : state.isFocused
        ? 'var(--brand-primary-soft)'
        : 'transparent',
    color: state.isSelected ? 'var(--color-primary-foreground)' : 'var(--foreground)',
    cursor: 'pointer',
    '&:active': { backgroundColor: 'var(--brand-primary-soft)' },
  }),
  menu: (provided:any) => ({
    ...provided,
    border: '1px solid #e2e8f0 ',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--background)',
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
    overflow: 'hidden',
  }),
  menuList: (provided:any) => ({ ...provided, padding: '0.25rem' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided:any) => ({ ...provided, color: 'var(--muted-foreground)' }),
};

const CustomReactSelect = (props:any) => {
    return(
        <Select 
            theme={globalTheme}
            styles={globalStyles}
            {...props}
        />
    )
}

export default CustomReactSelect
