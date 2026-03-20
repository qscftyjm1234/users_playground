import React from 'react';
import { Input as AntInput } from 'antd';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Input = ({ className, prefix, ...props }) => {
  return (
    <AntInput
      prefix={prefix}
      className={cn(
        "!rounded-2xl !py-3 !px-4 !bg-white dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !shadow-sm focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/10 !text-slate-900 dark:!text-white !transition-all duration-300",
        className
      )}
      {...props}
    />
  );
};

export default Input;
