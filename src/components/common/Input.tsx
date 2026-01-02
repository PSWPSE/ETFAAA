import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  
  return (
    <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`
            ${styles.input}
            ${leftIcon ? styles.hasLeftIcon : ''}
            ${rightIcon ? styles.hasRightIcon : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;




