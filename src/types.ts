export type DatabaseUser = {
  id: string
  email: string
}

export function statusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500 text-white'
    case 'accepted':
      return 'bg-green-500 text-white'
    case 'rejected':
      return 'bg-red-500 text-white'
    case 'completed':
      return 'bg-gray-500 text-white'
    case 'need_revision':
      return 'bg-orange-500 text-white'
    case 'review_evidence':
      return 'bg-indigo-500 text-white'
    case 'need_revision':
      return 'bg-purple-500 text-white' // warna baru untuk status on_hold
    default:
      return 'bg-gray-300 text-gray-700'
  }
}
