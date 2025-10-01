interface MarkdownProps {
  content: string
  className?: string
}

export default function Markdown({ content, className = "" }: MarkdownProps) {
  const renderContent = (text: string) => {
    // Split content by double line breaks to create paragraphs
    const paragraphs = text.trim().split(/\n\n+/)

    return paragraphs
      .map((paragraph) => {
        let rendered = paragraph.trim()

        // Handle bold text **text**
        rendered = rendered.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

        // Handle single line breaks within paragraphs
        rendered = rendered.replace(/\n/g, "<br />")

        // Handle bullet points starting with -
        if (rendered.includes("- ")) {
          const lines = rendered.split("<br />")
          const listItems = lines
            .filter((line) => line.trim().startsWith("- "))
            .map((line) => `<li>${line.replace(/^- /, "").trim()}</li>`)
            .join("")

          if (listItems) {
            return `<ul class="list-disc list-inside space-y-2 ml-4 my-4">${listItems}</ul>`
          }
        }

        // Wrap in paragraph tag with spacing
        return `<p class="mb-4 last:mb-0">${rendered}</p>`
      })
      .join("")
  }

  return (
    <div
      className={`w-full md:max-w-md paragraph-text text-sm md:text-base leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
    />
  )
}
