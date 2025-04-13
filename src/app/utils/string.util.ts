export const formatString = (str: string): string => {
  if (!str) return '';

  return str.replace(/_/g, ' ')
};
