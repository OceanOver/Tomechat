import { memo } from 'react';

/**
 * Circular spinner with a centered stop square, used while a response
 * is being aborted/generated. The rotating arc is a SMIL transform.
 */
const StopLoadingIcon = memo(() => (
  <span className="flex size-4 items-center justify-center text-muted-foreground">
    <svg height={16} viewBox="0 0 1024 1024" width={16} xmlns="http://www.w3.org/2000/svg">
      <g fill="none">
        <circle cx={512} cy={512} fill="none" r={426} stroke="currentColor" strokeWidth={72} />
        <g>
          <path
            d="M938.667 512C938.667 276.359 747.64 85.333 512 85.333"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={73}
          >
            <animateTransform
              attributeName="transform"
              dur="1s"
              from="0 512 512"
              repeatCount="indefinite"
              to="360 512 512"
              type="rotate"
            />
          </path>
        </g>
        <rect fill="currentColor" height={252} rx={24} width={252} x={386} y={386} />
      </g>
    </svg>
  </span>
));

export default StopLoadingIcon;
