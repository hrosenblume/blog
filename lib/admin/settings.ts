/**
 * Settings update helpers for admin API routes.
 * Reduces boilerplate in settings PATCH handlers.
 */

type StringFields<T> = {
  [K in keyof T]: T[K] extends string | null | undefined ? K : never
}[keyof T]

/**
 * Build an update object from request body for string fields.
 * Only includes fields that are present in the body and are strings.
 * 
 * @param body - Request body object
 * @param fields - Array of field names to extract
 * @returns Partial update object with only valid string fields
 */
export function buildStringUpdateData<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
  fields: readonly (keyof T)[]
): Partial<T> {
  const updateData: Partial<T> = {}
  
  for (const field of fields) {
    const key = field as string
    if (typeof body[key] === 'string') {
      (updateData as Record<string, unknown>)[key] = body[key]
    }
  }
  
  return updateData
}

/**
 * Build an update object with type-specific handling.
 * Supports string, boolean, and nullable fields.
 * 
 * @param body - Request body object
 * @param fieldTypes - Object mapping field names to their expected types
 * @returns Partial update object
 */
export function buildTypedUpdateData<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
  fieldTypes: Partial<Record<keyof T, 'string' | 'boolean' | 'nullable-string'>>
): Partial<T> {
  const updateData: Partial<T> = {}
  
  for (const [field, type] of Object.entries(fieldTypes)) {
    const value = body[field]
    
    switch (type) {
      case 'string':
        if (typeof value === 'string') {
          (updateData as Record<string, unknown>)[field] = value
        }
        break
      case 'boolean':
        if (typeof value === 'boolean') {
          (updateData as Record<string, unknown>)[field] = value
        }
        break
      case 'nullable-string':
        // undefined means don't update, string/null means set value
        if (value !== undefined) {
          (updateData as Record<string, unknown>)[field] = value
        }
        break
    }
  }
  
  return updateData
}
