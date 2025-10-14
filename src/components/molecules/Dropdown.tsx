/**
 * Dropdown Component (Molecule)
 *
 * Accessible dropdown menu
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'

export interface DropdownItem {
  label: string
  value: string
  icon?: React.ReactNode
  disabled?: boolean
  divider?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  onSelect: (value: string) => void
  position?: 'left' | 'right'
  className?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  onSelect,
  position = 'left',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (value: string, disabled?: boolean) => {
    if (disabled) return
    onSelect(value)
    setIsOpen(false)
  }

  const positionClasses = position === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 w-56 ${positionClasses}
            rounded-lg shadow-lg
            bg-white dark:bg-gray-800
            ring-1 ring-black ring-opacity-5
          `}
        >
          <div className="py-1" role="menu">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.divider ? (
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                ) : (
                  <button
                    onClick={() => handleSelect(item.value, item.disabled)}
                    disabled={item.disabled}
                    className={`
                      w-full text-left px-4 py-2 text-sm flex items-center gap-2
                      ${
                        item.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                    role="menuitem"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

Dropdown.displayName = 'Dropdown'
