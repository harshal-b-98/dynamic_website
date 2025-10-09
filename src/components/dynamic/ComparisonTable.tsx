/**
 * Comparison Table Component
 *
 * Side-by-side comparison using shadcn/ui Table
 */

import { DynamicComponentProps } from '@/lib/component-loader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ComparisonColumn {
  name: string
  highlighted?: boolean
  price?: string
}

interface ComparisonRow {
  feature: string
  values: (string | boolean)[]
}

export default function ComparisonTable({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const columns: ComparisonColumn[] = props.columns || content?.columns || []
  const rows: ComparisonRow[] = props.rows || content?.rows || []

  return (
    <div className="comparison-table overflow-x-auto">
      {/* Section Header */}
      {(props.title || content?.title) && (
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {props.title || content?.title}
        </h2>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Feature</TableHead>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`text-center font-semibold ${
                  column.highlighted ? 'bg-blue-50' : ''
                }`}
              >
                <div className="mb-1">{column.name}</div>
                {column.price && (
                  <div className="text-2xl font-bold">{column.price}</div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="font-medium">{row.feature}</TableCell>
              {row.values.map((value, colIndex) => (
                <TableCell
                  key={colIndex}
                  className={`text-center ${
                    columns[colIndex]?.highlighted ? 'bg-blue-50' : ''
                  }`}
                >
                  {typeof value === 'boolean' ? (
                    value ? (
                      <svg className="w-6 h-6 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )
                  ) : (
                    <span>{value}</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
