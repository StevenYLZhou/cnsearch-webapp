import CaseForm from '@/components/CaseForm'
import Link from 'next/link'

export default function NewCasePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/cases" className="hover:text-blue-600">Cases</Link>
        <span>/</span>
        <span className="text-gray-800">New Case</span>
      </div>
      <h1 className="text-xl font-bold text-gray-900">Add New Case</h1>
      <CaseForm mode="create" />
    </div>
  )
}
