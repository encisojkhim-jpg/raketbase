// Shared rating vocabulary. Keep the keys in sync with backend/src/utils/ratings.js.
//
// Roles use the same names as the rest of the app:
//   'freelancer' = the person as a freelancer (rated by their client)
//   'customer'   = the person as a client     (rated by their freelancer)
export const CRITERIA = {
  freelancer: [
    { key: 'quality_rating', label: 'Quality of work', hint: 'How good was the finished work?' },
    { key: 'communication_rating', label: 'Communication', hint: 'Were they clear and easy to reach?' },
    { key: 'timeliness_rating', label: 'Timeliness', hint: 'Did they deliver when promised?' },
  ],
  customer: [
    { key: 'clarity_rating', label: 'Clarity', hint: 'Were the requirements clear and complete?' },
    { key: 'responsiveness_rating', label: 'Responsiveness', hint: 'Did they reply and give feedback promptly?' },
    { key: 'payment_rating', label: 'Payment', hint: 'Was payment handled fairly and on time?' },
  ],
};

export const COMMENT_MAX = 1000;

export function formatAverage(value) {
  return value == null ? '—' : Number(value).toFixed(1);
}

export function reviewCountLabel(count) {
  return `${count} review${count === 1 ? '' : 's'}`;
}
