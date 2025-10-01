'use client';
import { useEffect, useRef } from 'react';

export default function DynamicBackground() {
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		el.style.setProperty('--mouse-x', '50%');
		el.style.setProperty('--mouse-y', '50%');

		let raf = 0;
		function onMove(e: MouseEvent) {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				const rect = el.getBoundingClientRect();
				const x = ((e.clientX - rect.left) / rect.width) * 100;
				const y = ((e.clientY - rect.top) / rect.height) * 100;
				el.style.setProperty('--mouse-x', `${x}%`);
				el.style.setProperty('--mouse-y', `${y}%`);
			});
		}

		function onTouch(e: TouchEvent) {
			if (!e.touches.length) return;
			const t = e.touches[0];
			onMove({ clientX: t.clientX, clientY: t.clientY } as unknown as MouseEvent);
		}

		window.addEventListener('mousemove', onMove, { passive: true });
		window.addEventListener('touchmove', onTouch, { passive: true });

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('touchmove', onTouch);
		};
	}, []);

	return <div ref={ref} aria-hidden className="dynamic-bg" />;
}