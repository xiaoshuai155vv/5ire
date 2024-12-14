import './ToolSpinner.scss';

export default function ToolSpinner(props: { size?: number } & any) {
  const { size, ...rest } = props;
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="spinner-gF00">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="y" />
          <feColorMatrix
            in="y"
            mode="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"
            result="z"
          />
          <feBlend in="SourceGraphic" in2="z" />
        </filter>
      </defs>
      <g filter="url(#spinner-gF00)">
        <circle className="spinner_mHwL" cx="4" cy="12" r="3" fill="#555" />
        <circle className="spinner_ote2" cx="15" cy="12" r="8" fill="#555" />
      </g>
    </svg>
  );
}
