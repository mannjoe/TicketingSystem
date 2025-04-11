export const formatString = (str: string): string => {
  if (!str) return '';
  
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 