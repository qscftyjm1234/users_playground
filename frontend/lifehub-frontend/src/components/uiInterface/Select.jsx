import React from 'react';
import { Select as AntSelect } from 'antd';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Select = ({ className, ...props }) => {
  return (
    <AntSelect
      className={cn(
        "w-full !h-auto",
        className
      )}
      classNames={{
        popup: {
          root: "!rounded-2xl !shadow-xl !border-slate-50 dark:!border-slate-800 dark:!bg-slate-900 !p-1"
        }
      }}
      {...props}
    />
  );
};

export default Select;

