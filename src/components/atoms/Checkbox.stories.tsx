import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Checkbox checked state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the checkbox',
    },
    label: {
      control: 'text',
      description: 'Checkbox label text',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display',
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
    checked: false,
  },
}

export const Checked: Story = {
  args: {
    label: 'I agree to the terms',
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Subscribe to newsletter',
    helperText: 'Receive weekly updates about new features',
  },
}

export const WithError: Story = {
  args: {
    label: 'Agree to terms',
    error: 'You must accept the terms to continue',
  },
}
