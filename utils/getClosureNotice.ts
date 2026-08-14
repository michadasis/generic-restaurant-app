// The club closes for summer break around 26/06 and reopens 01/09 each year.
// The exact dates can shift a little year to year, so we show a heads-up
// banner during the week around each boundary instead of a hard cutoff.
export type ClosureNotice = 'closing' | 'reopening' | null;

const NOTICE_WINDOW_DAYS = 7;

export function getClosureNotice(date: Date = new Date()): ClosureNotice {
  const year  = date.getFullYear();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const closureStart = new Date(year, 5, 26); // June 26
  const closureEnd   = new Date(year, 8, 0); // through August 31 (day 0 of September)

  const reopenStart = new Date(year, 8, 1); // September 1
  const reopenEnd   = new Date(year, 8, NOTICE_WINDOW_DAYS); // through September 7

  if (today >= closureStart && today <= closureEnd) return 'closing';
  if (today >= reopenStart && today <= reopenEnd) return 'reopening';
  return null;
}
