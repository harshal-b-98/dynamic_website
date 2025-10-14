import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from './FormField'

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Input type',
    },
    required: {
      control: 'boolean',
      description: 'Mark field as required',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the field',
    },
  },
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: {
    label: 'Full Name',
    name: 'fullName',
    placeholder: 'Enter your full name',
    type: 'text',
  },
}

export const Email: Story = {
  args: {
    label: 'Email Address',
    name: 'email',
    placeholder: 'you@example.com',
    type: 'email',
    required: true,
  },
}

export const Password: Story = {
  args: {
    label: 'Password',
    name: 'password',
    placeholder: 'Enter password',
    type: 'password',
    required: true,
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    name: 'username',
    placeholder: 'Choose a username',
    helperText: 'Must be 3-20 characters, letters and numbers only',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email Address',
    name: 'email',
    placeholder: 'you@example.com',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    name: 'disabled',
    value: 'Cannot be edited',
    disabled: true,
  },
}
