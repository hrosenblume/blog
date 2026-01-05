'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'
import { BackLink } from '@/components/BackLink'

interface User { id: string; email: string; name: string | null; role: string }

// Consolidated page component for both create and edit
export function UserFormPage({ userId }: { userId?: string }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!userId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState('writer')

  const isEdit = !!userId

  useEffect(() => {
    if (!userId) return
    fetch(`/api/admin/users/${userId}`)
      .then(res => res.json())
      .then(data => { 
        setUser(data)
        setRole(data.role)
        setLoading(false) 
      })
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
      role,
    })

    const res = await fetch(
      isEdit ? `/api/admin/users/${userId}` : '/api/admin/users',
      { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body }
    )

    if (res.ok) {
      router.push('/settings/users')
    } else {
      const result = await res.json()
      setError(result.error ?? `Failed to ${isEdit ? 'update' : 'create'} user`)
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>
  if (isEdit && !user) return <div className="text-center py-8 text-destructive">User not found</div>

  return (
    <div>
      <BackLink href="/settings/users" label="Back to Users" />
      <h1 className="text-section font-bold mb-8">
        {isEdit ? 'Edit User' : 'Add New User'}
      </h1>
      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              type="email" 
              id="email" 
              name="email" 
              required 
              defaultValue={user?.email} 
              placeholder={user ? undefined : 'user@example.com'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              type="text" 
              id="name" 
              name="name" 
              defaultValue={user?.name ?? ''} 
              placeholder={user ? undefined : 'John Doe'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drafter">Drafter</SelectItem>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving && <PolyhedraCanvas shape="cube" size={16} clicked={true} />}
              {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create User')}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/settings/users">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
