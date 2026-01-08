// src/components/ui/MobileCard.tsx
// Mobile-optimized card component with better touch targets

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({ children, onClick, className = '' }: MobileCardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`
        w-full rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]' : ''}
        ${className}
      `}
      {...(onClick && { type: 'button' })}
    >
      {children}
    </Component>
  );
}

// Touch-friendly button with minimum 44x44 tap target
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  type = 'button',
}: TouchButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#1D4FD8] shadow-sm',
    secondary: 'bg-[#F3F4F6] text-[#333333] hover:bg-[#E5E7EB]',
    outline: 'border border-[#E5E7EB] bg-white text-[#333333] hover:bg-[#F3F4F6]',
  };
  
  // Ensure minimum 44x44px touch target
  const sizeClasses = {
    sm: 'min-h-[44px] px-4 py-2 text-sm',
    md: 'min-h-[48px] px-5 py-3 text-base',
    lg: 'min-h-[52px] px-6 py-3 text-lg',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}
