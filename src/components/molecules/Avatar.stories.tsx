import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'

const meta = {
  title: 'Molecules/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar size',
    },
    shape: {
      control: 'radio',
      options: ['circle', 'square'],
      description: 'Avatar shape',
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy'],
      description: 'Status indicator',
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User avatar',
    size: 'md',
  },
}

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
}

export const WithStatus: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=2',
    alt: 'User avatar',
    size: 'md',
    showStatus: true,
    status: 'online',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="XS" size="xs" />
      <Avatar name="SM" size="sm" />
      <Avatar name="MD" size="md" />
      <Avatar name="LG" size="lg" />
      <Avatar name="XL" size="xl" />
      <Avatar name="2XL" size="2xl" />
    </div>
  ),
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Online" showStatus status="online" />
      <Avatar name="Away" showStatus status="away" />
      <Avatar name="Busy" showStatus status="busy" />
      <Avatar name="Offline" showStatus status="offline" />
    </div>
  ),
}

export const SquareShape: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=3',
    alt: 'User avatar',
    size: 'lg',
    shape: 'square',
  },
}

export const Fallback: Story = {
  args: {
    size: 'md',
  },
}
