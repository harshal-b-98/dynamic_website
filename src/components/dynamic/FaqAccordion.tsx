/**
 * FAQ Accordion Component
 *
 * Collapsible FAQ items using shadcn/ui Accordion
 */

import { DynamicComponentProps } from '@/lib/component-loader'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FaqItem {
  question: string
  answer: string
}

export default function FaqAccordion({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const faqs: FaqItem[] = props.faqs || content?.faqs || []

  return (
    <div className="faq-accordion max-w-3xl mx-auto">
      {/* Section Header */}
      {(props.title || content?.title) && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          {props.title || content?.title}
        </h2>
      )}

      {/* FAQ Items */}
      <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-semibold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
