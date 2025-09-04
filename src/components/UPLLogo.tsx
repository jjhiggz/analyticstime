interface UPLLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

export const UPLLogo = ({ className = '', size = 'md' }: UPLLogoProps) => {
  return (
    <div className={`${className} flex items-center space-x-2`}>
      {/* Orange circle representing the UPL logo */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg">
          <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-yellow-300 via-orange-300 to-orange-400 opacity-80" />
        </div>
      </div>
      <span className="text-gray-900 font-bold text-xl tracking-tight">UPL</span>
    </div>
  )
}
