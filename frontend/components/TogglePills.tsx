'use client'

interface TogglePillsProps {
  options: string[]
  selected: string
  onSelect: (option: string) => void
}

export default function TogglePills({ options, selected, onSelect }: TogglePillsProps) {
  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === option 
              ? 'pill-active' 
              : 'pill-inactive'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
