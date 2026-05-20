export const fmt = (n, decimals = 2) => 
  n != null && !isNaN(n)
    ? Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : '—';