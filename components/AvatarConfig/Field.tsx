interface FieldProps {
  label: string;
  children: React.ReactNode;
  tooltip?: string;
}

export const Field = (props: FieldProps) => {
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <label className="text-white text-xs sm:text-sm font-bold bg-gradient-to-r from-gray-700/50 to-gray-800/50 px-3 py-2 rounded-xl border border-gray-600/50 text-center">
        {props.label}
      </label>
      {props.children}
    </div>
  );
};
