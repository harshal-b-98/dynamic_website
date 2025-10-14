import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'

const meta = {
  title: 'Molecules/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Toast type',
    },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'],
      description: 'Toast position',
    },
    duration: {
      control: 'number',
      description: 'Auto-dismiss duration in milliseconds',
    },
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    message: 'Changes saved successfully!',
    type: 'success',
    onClose: () => console.log('Toast closed'),
  },
}

export const Error: Story = {
  args: {
    message: 'An error occurred while saving your changes.',
    type: 'error',
    onClose: () => console.log('Toast closed'),
  },
}

export const Warning: Story = {
  args: {
    message: 'Please review your changes before submitting.',
    type: 'warning',
    onClose: () => console.log('Toast closed'),
  },
}

export const Info: Story = {
  args: {
    message: 'New features are available in this version.',
    type: 'info',
    onClose: () => console.log('Toast closed'),
  },
}

export const TopLeft: Story = {
  args: {
    message: 'Toast positioned at top-left',
    type: 'info',
    position: 'top-left',
    onClose: () => console.log('Toast closed'),
  },
}

export const BottomCenter: Story = {
  args: {
    message: 'Toast positioned at bottom-center',
    type: 'info',
    position: 'bottom-center',
    onClose: () => console.log('Toast closed'),
  },
}

export const LongDuration: Story = {
  args: {
    message: 'This toast will stay visible for 10 seconds',
    type: 'info',
    duration: 10000,
    onClose: () => console.log('Toast closed'),
  },
}
