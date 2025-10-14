import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'

const meta = {
  title: 'Molecules/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

const ModalWithState = (args: any) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Open Modal
      </button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export const Default: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Modal Title',
    children: <p>This is the modal content. It can contain any React components.</p>,
  },
}

export const WithFooter: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Confirm Action',
    children: <p>Are you sure you want to proceed with this action?</p>,
    footer: (
      <>
        <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          Cancel
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Confirm
        </button>
      </>
    ),
  },
}

export const SmallSize: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Small Modal',
    size: 'sm',
    children: <p>This is a small modal.</p>,
  },
}

export const LargeSize: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Large Modal',
    size: 'lg',
    children: (
      <div className="space-y-4">
        <p>This is a large modal with more content.</p>
        <p>It can display more detailed information or complex forms.</p>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          Content area
        </div>
      </div>
    ),
  },
}

export const NoCloseButton: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Cannot Close',
    showCloseButton: false,
    closeOnOverlayClick: false,
    closeOnEsc: false,
    children: <p>This modal cannot be closed by clicking outside or pressing ESC.</p>,
    footer: (
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Complete Action
      </button>
    ),
  },
}
