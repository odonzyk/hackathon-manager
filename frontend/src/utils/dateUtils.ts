const getDate = (date: Date | string | number): Date => {
  if (typeof date === 'string') return new Date(date);
  if (typeof date === 'number') return new Date(date * 1000);
  return date;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short', // z.B. "Di"
    year: 'numeric', // z.B. "2025"
    month: 'short', // z.B. "Jan"
    day: 'numeric', // z.B. "15"
    hour: '2-digit', // z.B. "14"
    minute: '2-digit', // z.B. "30"
  };

  return new Intl.DateTimeFormat('de-DE', options).format(date);
};

export const formatCountdown = (timeLeft: number) => {
  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  //  const seconds = Math.floor(timeLeft % 60);
  return `${days} Tage ${hours} Stunden ${minutes} Minuten`;
};

export const formatTimeLeft = (timeLeft: number) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  return `${minutes} min ${seconds} sec`;
};

export const formatTime = (date: Date | null): string => {
  if (!date) return '';
  const hours = date.getHours().toString().padStart(2, '0'); // Stunden mit führender Null
  const minutes = date.getMinutes().toString().padStart(2, '0'); // Minuten mit führender Null
  return `${hours}:${minutes} Uhr`;
};

export const formatTimeShort = (date: Date | string | null): string => {
  if (!date) return '';
  const tmpDate = getDate(date);
  const hours = tmpDate.getHours().toString().padStart(2, '0'); // Stunden mit führender Null
  const minutes = tmpDate.getMinutes().toString().padStart(2, '0'); // Minuten mit führender Null
  return `${hours}:${minutes}`;
};

export const formatDate = (date: Date | string | number | null): string => {
  if (!date) return '';
  const tmpDate = getDate(date);
  return tmpDate.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const formatDay = (date: Date | string | null): string => {
  if (!date) return '';
  const tmpDate = getDate(date);
  return tmpDate.getDay().toString(); // Stunden mit führender Null
};

export const formatMonthStr = (date: Date | string | null): string => {
  if (!date) return '';
  const tmpDate = getDate(date);
  return tmpDate.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
};
