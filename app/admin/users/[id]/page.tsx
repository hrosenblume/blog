'use client'

import { useParams } from 'next/navigation'
import { UserFormPage } from '@/components/admin/UserForm'

export default function EditUserPage() {
  const params = useParams()
  return <UserFormPage userId={params.id as string} />
}
