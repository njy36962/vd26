export interface RepelOptions {
	x: number;
	y: number;
	homeX?: number; 
	homeY?: number;
	repelStrength?: number;
	springStrength?: number;
	damping?: number;
	activationRadius?: number;
	isHovering?: boolean; // Only repel when cursor is hovering on the box
}

export function repel(node: HTMLElement, getOptions: () => RepelOptions) {
	// Physics state
	let posX = 0;
	let posY = 0;
	let velX = 0;
	let velY = 0;
	
	// Track home position separately. 
	// If passed in options, use that. Otherwise use initial position.
	let homeX = 0;
	let homeY = 0;

	// Config defaults - tuned for stable physics
	const defaults = {
		repelStrength: 20,         // Lower for stable push
		springStrength: 0.03,     // Moderate spring for return
		damping: 0.6,            // High damping for stability
		activationRadius: 1000     // Larger radius for more distance from cursor
	};
	
	// Smoothing factor for velocity (0-1, higher = smoother but slower response)
	const velocitySmoothing = 1;
	
	// Initialize home from current style/layout if possible
	// (This is a fallback if homeX/Y aren't provided immediately)
	const style = window.getComputedStyle(node);
	homeX = parseFloat(style.left) || 0;
	homeY = parseFloat(style.top) || 0;
	posX = homeX;
	posY = homeY;

	let animationId: number;

	function animate() {
		const options = getOptions();
		
		const previousHomeX = homeX;
		const previousHomeY = homeY;
		
		// Update home if provided
		if (options.homeX !== undefined) homeX = options.homeX;
		if (options.homeY !== undefined) homeY = options.homeY;

		// Snap to new home if we were resting at the old home
		// This prevents the box from "flying" in when the layout initializes from (0,0) to center
		if (Math.abs(velX) < 0.1 && Math.abs(velY) < 0.1 && 
			Math.abs(posX - previousHomeX) < 1 && Math.abs(posY - previousHomeY) < 1) {
			posX = homeX;
			posY = homeY;
		}

		const repelStrength = options.repelStrength ?? defaults.repelStrength;
		const springStrength = options.springStrength ?? defaults.springStrength;
		const damping = options.damping ?? defaults.damping;
		const activationRadius = options.activationRadius ?? defaults.activationRadius;
		const isHovering = options.isHovering ?? false;

		const rect = node.getBoundingClientRect();
		const boxCenterX = rect.left + rect.width / 2;
		const boxCenterY = rect.top + rect.height / 2;

		const dx = options.x - boxCenterX;
		const dy = options.y - boxCenterY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Reset forces
		let forceX = 0;
		let forceY = 0;

		// Repulsion force - only when hovering and within activation radius
		if (isHovering && distance > 0 && distance < activationRadius) {
			// Inverse square law for more realistic push
			const forceMagnitude = repelStrength / (distance * distance);
			forceX = -(dx / distance) * forceMagnitude * activationRadius;
			forceY = -(dy / distance) * forceMagnitude * activationRadius;
		}

		// Spring force back to home
		const springX = (homeX - posX) * springStrength;
		const springY = (homeY - posY) * springStrength;
		
		// Apply forces to velocity
		velX += forceX;
		velY += forceY;
		velX += springX;
		velY += springY;

		// Apply damping
		velX *= damping;
		velY *= damping;

		// Update position
		posX += velX;
		posY += velY;

		// Padding/Boundary check
		const padding = 50;
		posX = Math.max(-padding, Math.min(window.innerWidth - node.offsetWidth + padding, posX));
		posY = Math.max(-padding, Math.min(window.innerHeight - node.offsetHeight + padding, posY));

		// Apply transform
		// We use translate to offset from the "home" position determined by layout (top/left)
		// Wait, `posX` and `posY` tracks the *absolute* intended position on screen (including physics).
		// `homeX/homeY` tracks the *layout* position (where it rests).
		// So `translate(posX - homeX, posY - homeY)` applies the physics delta.
		// This assumes `node.style.left/top` are set to `homeX/homeY` by the parent.
		
		node.style.transform = `translate(${posX - homeX}px, ${posY - homeY}px)`;

		animationId = requestAnimationFrame(animate);
	}

	animationId = requestAnimationFrame(animate);

	return {
        // In Svelte 5, if the arg is a getter `() => val`, this update might not be called, 
        // the function just returns new values.
        // If the arg is a plain object, `update` is called.
        // We implemented `getOptions()` call in the loop, so we expect a getter.
		update(newGetOptions: () => RepelOptions) {
			getOptions = newGetOptions;
		},
		destroy() {
			cancelAnimationFrame(animationId);
            node.style.transform = '';
		}
	};
}
