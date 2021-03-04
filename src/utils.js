const dateOptions = {
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
  timeZone: 'America/Los_Angeles'
};
export const formatDate = (date, options) => {
  if (date) {
    return new Intl.DateTimeFormat('default', {...dateOptions, ...options}).format(new Date(date))
  }
}