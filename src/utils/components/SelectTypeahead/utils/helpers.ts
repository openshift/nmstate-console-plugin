export const createItemId = (value: string | number) =>
  `select-typeahead-${String(value)?.replace(' ', '-')}`;
