import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CaseForm from '@/components/CaseForm'
import Link from 'next/link'
import ArchiveButton from '@/components/ArchiveButton'

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: c } = await supabase
    .from('cases')
    .select('*, case_sources(*)')
    .eq('id', id)
    .single()

  if (!c) notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/cases" className="hover:text-blue-600">Cases</Link>
        <span>/</span>
        <span className="text-gray-800">{c.case_code}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Edit Case</h1>
        <ArchiveButton caseId={c.id} isPublished={c.is_published} caseName={c.case_name} />
      </div>
      <CaseForm mode="edit" initialData={c as any} />
    </div>
  )
}
