'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

interface User { id: string; email: string; name: string | null; role: string }

// Consolidated page component for both create and edit
export function UserFormPage({ userId }: { userId?: string }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!userId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!userId

  useEffect(() => {
    if (!userId) return
    fetch(`/api/admin/users/${userId}`)
      .then(res => res.json())
      .then(data => { setUser(data); setLoading(false) })
      .catch(() => { setError('Failed to load user'); setLoading(false) })
  }, [userId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const body = JSON.stringify({
      email: formData.get('email'),
      name: formData.get('name'),
      role: formData.get('role'),
    })

    const res = await fetch(
      isEdit ? `/api/admin/users/${userId}` : '/api/admin/users',
      { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body }
    )

    if (res.ok) {
      router.push('/admin/users')
    } else {
      const result = await res.json()
      setError(result.error ?? `Failed to ${isEdit ? 'update' : 'create'} user`)
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>
  if (isEdit && !user) return <div className="text-center py-8 text-red-500">User not found</div>

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          ← Back to Users
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        {isEdit ? 'Edit User' : 'Add New User'}
      </h1>
      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className={labelClass}>Email *</label>
            <input type="email" id="email" name="email" required defaultValue={user?.email} placeholder={user ? undefined : 'user@example.com'} className={inputClass} />
          </div>

          <div>
            <label htmlFor="name" className={labelClass}>Name</label>
            <input type="text" id="name" name="name" defaultValue={user?.name ?? ''} placeholder={user ? undefined : 'John Doe'} className={inputClass} />
          </div>

          <div>
            <label htmlFor="role" className={labelClass}>Role</label>
            <select id="role" name="role" defaultValue={user?.role ?? 'writer'} className={inputClass}>
              <option value="writer">Writer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create User')}
            </button>
            <Link href="/admin/users" className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

