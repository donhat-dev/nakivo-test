import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

/**
 * ScrollTrigger batch reveal for all `.reveal` elements inside a container.
 * Elements begin invisible via the `.reveal` CSS class and are animated into view
 * when they enter the viewport.
 */
export function useReveal(containerRef: RefObject<Element | null>) {
  useGSAP(
    () => {
      const root = containerRef.current ?? document.body;
      const targets = gsap.utils.toArray<Element>(".reveal", root);
      if (!targets.length) return;

      ScrollTrigger.batch(targets, {
        start: "top 90%",
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 44, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.82,
              ease: "power3.out",
              stagger: 0.1,
              clearProps: "filter",
            },
          );
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: containerRef, dependencies: [] },
  );
}
