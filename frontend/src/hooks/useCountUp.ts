import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Attaches to a display element and counts up from 0 to `target` on mount.
 * Attach the returned ref to any HTMLElement that renders the number.
 */
export function useCountUp(target: number, delay = 0.3) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current || !isFinite(target)) return;

    ref.current.textContent = "0";
    const obj = { val: 0 };

    const tween = gsap.to(obj, {
      val: target,
      duration: 1.3,
      ease: "power2.out",
      delay,
      onUpdate() {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.val).toLocaleString();
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [target, delay]);

  return ref;
}
