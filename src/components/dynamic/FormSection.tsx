'use client'

/**
 * Form Section Component
 *
 * Generic form using shadcn/ui form components
 */

import { useState } from 'react'
import { DynamicComponentProps } from '@/lib/component-loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  required?: boolean
  options?: string[]
  placeholder?: string
}

export default function FormSection({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const fields: FormField[] = props.fields || content?.fields || []
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Handle form submission
    console.log('Form submitted:', formData)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)

    alert('Form submitted successfully!')
  }

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="form-section max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          {(props.title || content?.title) && (
            <CardTitle className="text-2xl">{props.title || content?.title}</CardTitle>
          )}
          {(props.description || content?.description) && (
            <CardDescription>{props.description || content?.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    rows={4}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value) => handleChange(field.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option, i) => (
                        <SelectItem key={i} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : props.submitText || 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
