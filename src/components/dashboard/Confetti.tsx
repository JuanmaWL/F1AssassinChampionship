import React, { useEffect } from 'react';

export function Confetti() {
  useEffect(() => {
    const colors = [
      "#ff0a54", "#ff477e", "#ff85a1",
      "#00f5d4", "#9b5de5",
      "#fee440", "#00bbf9"
    ];

    let intervalId: NodeJS.Timeout;

    // Add perspective to body for 3D effect
    const originalPerspective = document.body.style.perspective;
    const originalOverflowX = document.body.style.overflowX;
    document.body.style.perspective = '1000px';
    document.body.style.overflowX = 'hidden';

    function createConfetti() {
      const confetti = document.createElement("div");
      confetti.classList.add("f1-confetti");

      const piece = document.createElement("div");
      piece.classList.add("f1-piece");

      const front = document.createElement("div");
      const back = document.createElement("div");

      front.classList.add("f1-side");
      back.classList.add("f1-side", "f1-back");

      const color = colors[Math.floor(Math.random() * colors.length)];
      front.style.background = color;
      back.style.background = color;

      piece.appendChild(front);
      piece.appendChild(back);
      confetti.appendChild(piece);

      confetti.style.left = Math.random() * window.innerWidth + "px";

      const fallDuration = Math.random() * 4 + 4;
      const spinDuration = Math.random() * 3 + 2;

      confetti.style.animationDuration = fallDuration + "s";
      piece.style.animationDuration = spinDuration + "s";

      document.body.appendChild(confetti);

      setTimeout(() => {
        if (document.body.contains(confetti)) {
          confetti.remove();
        }
      }, fallDuration * 1000);
    }

    intervalId = setInterval(createConfetti, 90);

    return () => {
      clearInterval(intervalId);
      document.body.style.perspective = originalPerspective;
      document.body.style.overflowX = originalOverflowX;
    };
  }, []);

  return (
    <style>{`
      .f1-confetti {
        position: fixed;
        top: -50px;
        transform-style: preserve-3d;
        animation: f1-fall linear forwards;
        z-index: 9999;
        pointer-events: none;
      }

      .f1-piece {
        position: relative;
        transform-style: preserve-3d;
        animation: f1-spin linear infinite;
      }

      .f1-side {
        position: absolute;
        width: 12px;
        height: 18px;
        backface-visibility: hidden;
      }

      .f1-back {
        transform: rotateY(180deg);
        filter: brightness(0.6);
      }

      @keyframes f1-fall {
        0% {
          transform: 
            translateY(0) 
            translateZ(-800px) 
            scale(0.3);
          opacity: 0.8;
        }
        100% {
          transform: 
            translateY(110vh) 
            translateZ(300px) 
            scale(1.4);
          opacity: 1;
        }
      }

      @keyframes f1-spin {
        0% {
          transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
        }
        100% {
          transform: rotateX(720deg) rotateY(720deg) rotateZ(360deg);
        }
      }
    `}</style>
  );
}
