import React, { useEffect, useRef } from 'react';

interface F1CarAnimationProps {
  primaryColor?: string;
  helmetColor?: string;
  className?: string;
}

export function F1CarAnimation({ 
  primaryColor = '#E85725', 
  helmetColor = '#EF3F33',
  className = ''
}: F1CarAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const paths = svgRef.current.querySelectorAll('path.air');
    
    paths.forEach((path: any, index) => {
      const totalLength = path.getTotalLength();
      path.style.setProperty('--stroke-dash', totalLength);
      path.style.setProperty('--stroke-dash-negative', -totalLength);
      
      if (index === 0) {
        path.style.animationDelay = `${0.08 * (paths.length - 2)}s`;
      } else {
        path.style.animationDelay = `${0.08 * index}s`;
      }
    });
  }, []);

  return (
    <div className={`f1-car-animation-container ${className}`}>
      <style>{`
        .f1-car-animation-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          overflow: hidden;
        }
        .f1-car-animation-container > svg {
          width: 100%;
          max-width: 600px;
          height: auto;
          --stroke-dash: 46;
          --stroke-dash-negative: -46;
        }
        .f1-car-animation-container g#car {
          transform: translateX(-3px);
          animation: translate 2s ease-in-out infinite;
        }
        .f1-car-animation-container path#shadow {
          animation: skew 2s ease-in-out infinite;
        }
        .f1-car-animation-container g.wheels use {
          animation: rotate 2s linear infinite;
        }
        .f1-car-animation-container path.air {
          stroke-dasharray: var(--stroke-dash);
          stroke-dashoffset: var(--stroke-dash);
          animation: offset 2s linear infinite;
          opacity: 0;
        }
        @keyframes translate {
          50% { transform: translateX(3px); }
          100% { transform: translateX(-3px); }
        }
        @keyframes skew {
          50% { transform: skewX(-20deg); }
        }
        @keyframes rotate {
          50% { transform: rotate(4turn); }
          100% { transform: rotate(6turn); }
        }
        @keyframes offset {
          1% { opacity: 1; }
          15% { stroke-dashoffset: 0; opacity: 1; }
          24% { opacity: 1; }
          25% { opacity: 0; stroke-dashoffset: var(--stroke-dash-negative); }
          100% { stroke-dashoffset: var(--stroke-dash-negative); }
        }
      `}</style>
      
      <svg ref={svgRef} viewBox="0 0 178 40" width="178" height="40">
          <path
              className="air"
              d="M 46 16.5 h -20 a 8 8 0 0 1 0 -16"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round">
          </path>

          <g id="car">
              <svg viewBox="0 0 118 28.125" x="30" y="11.725" width="118" height="28.125">
                  <defs>
                      <circle id="circle" cx="0" cy="0" r="1"></circle>
                      <g id="wheel">
                          <use href="#circle" fill="#1E191A" transform="scale(10)"></use>
                          <use href="#circle" fill="#fff" transform="scale(5)"></use>
                          <path
                              fill="#1E191A"
                              stroke="#1E191A"
                              strokeWidth="0.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.2"
                              strokeDashoffset="0"
                              d="M -3.5 0 a 4 4 0 0 1 7 0 a 3.5 3.5 0 0 0 -7 0">
                          </path>
                          <use href="#circle" fill="#1E191A" transform="scale(1.5)"></use>
                          <path
                              fill="none"
                              stroke="#F9B35C"
                              strokeWidth="0.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="20 14 8 5"
                              d="M 0 -7.5 a 7.5 7.5 0 0 1 0 15 a 7.5 7.5 0 0 1 0 -15">
                          </path>
                          <path
                              fill="none"
                              stroke="#fff"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.1"
                              strokeDashoffset="0"
                              d="M -6.5 -6.25 a 10 10 0 0 1 13 0 a 9 9 0 0 0 -13 0">
                          </path>
                      </g>
                  </defs>
                  <g transform="translate(51.5 11.125)">
                      <path
                          strokeWidth="2"
                          stroke="#1E191A"
                          fill={helmetColor}
                          d="M 0 0 v -2 a 4.5 4.5 0 0 1 9 0 v 2">
                      </path>
                      <rect
                          fill="#1E191A"
                          x="3.25"
                          y="-3"
                          width="5"
                          height="3">
                      </rect>
                  </g>

                  <g transform="translate(10 24.125)">
                      <g transform="translate(59 0)">
                          <path
                              id="shadow"
                              opacity="0.7"
                              fill="#1E191A"
                              d="M -64 0 l -4 4 h 9 l 8 -1.5 h 100 l -3.5 -2.5">
                          </path>
                      </g>
                      <path
                          fill={primaryColor}
                          stroke="#1E191A"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M 0 0 v -10 l 35 -13 v 5 l 4 0.5 l 0.5 4.5 h 35.5 l 30 13">
                      </path>

                      <g
                          fill={primaryColor}
                          stroke="#1E191A"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M -6 0 v -22 h 10 z"></path>
                          <path d="M 105 0 h -3 l -12 -5.2 v 6.2 h 12"></path>
                      </g>

                      <g fill="#949699" opacity="0.7">
                          <rect x="16" y="-6" width="55" height="6"></rect>
                          <path d="M 24 -14 l 13 -1.85 v 1.85"></path>
                      </g>

                      <g
                          fill="none"
                          stroke="#1E191A"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path strokeDasharray="30 7 42" d="M 90 0 h -78"></path>
                          <path d="M 39.5 -13 h -15"></path>
                      </g>

                      <path
                          fill={primaryColor}
                          stroke="#1E191A"
                          strokeWidth="2.25"
                          strokeLinejoin="round"
                          d="M 48.125 -6 h -29 v 6 h 29">
                      </path>

                      <rect x="48" y="-7.125" width="6.125" height="7.125" fill="#1E191A"></rect>

                      <g fill="#1E191A">
                          <rect x="60" y="-15" width="1" height="6"></rect>
                          <rect x="56.5" y="-17.5" width="6" height="2.5"></rect>
                      </g>
                  </g>

                  <g className="wheels" transform="translate(0 18.125)">
                      <g transform="translate(10 0)">
                          <use href="#wheel"></use>
                      </g>

                      <g transform="translate(87 0)">
                          <use href="#wheel" strokeDashoffset="-22"></use>
                      </g>
                  </g>
              </svg>
          </g>

          <g
              fill="none"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round">
              <path className="air" stroke={primaryColor} d="M 177.5 34 h -10 q -16 0 -32 -8"></path>
              <path className="air" stroke="#949699" d="M 167 28.5 c -18 -2 -22 -8 -37 -10.75"></path>
              <path className="air" stroke="#949699" d="M 153 20 q -4 -1.7 -8 -3"></path>
              <path className="air" stroke={primaryColor} d="M 117 16.85 c -12 0 -12 16 -24 16 h -8"></path>
              <path className="air" stroke="#949699" d="M 65 12 q -5 3 -12 3.8"></path>
              <path className="air" stroke="#949699" strokeDasharray="9 10" d="M 30 13.5 h -2.5 q -5 0 -5 -5"></path>
              <path className="air" stroke="#949699" d="M 31 33 h -10"></path>
              <path className="air" stroke="#949699" d="M 29.5 23 h -12"></path>
              <path className="air" stroke="#949699" d="M 13.5 23 h -6"></path>
              <path className="air" stroke={primaryColor} d="M 28 28 h -27.5"></path>
          </g>
      </svg>
    </div>
  );
}
