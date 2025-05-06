// Helper Functions

function getChipPoint(chip, position) {
	// Returns a specific point on the chip relative to its container
	const chipRect = chip.getBoundingClientRect();
	const chipsRect = chip.parentElement.getBoundingClientRect();
	const top = chipRect.top - chipsRect.top;
	const right = (chipRect.left - chipsRect.left) + chipRect.width;
	const bottom = top + chipRect.height;
	const left = chipRect.left - chipsRect.left;
	const centerX = left + chipRect.width / 2;
	const centerY = top + chipRect.height / 2;

	switch (position) {
		case "topCenter":
			return { x: centerX, y: top };
		case "topRight":
			return { x: right, y: top };
		case "rightCenter":
			return { x: right, y: centerY };
		case "bottomRight":
			return { x: right, y: bottom };
		case "bottomCenter":
			return { x: centerX, y: bottom };
		case "bottomLeft":
			return { x: left, y: bottom };
		case "leftCenter":
			return { x: left, y: centerY };
		case "topLeft":
			return { x: left, y: top };
		case "center":
			return { x: centerX, y: centerY };
		default:
			throw new Error("Unknown position: " + position);
	}
}

function curvedPath(from, to, direction) {
	let start, end, horizontalScale, verticalScale;

	if (direction === "down") {
		// Roots: main chip is 'to', prerequisite is 'from'
		start = getChipPoint(from, "center");
		end = getChipPoint(to, "bottomCenter");
		horizontalScale = -0.45; // + in / - out
		verticalScale = 0.25;      // + up / - down
	} else {
		// Plant: main chip is 'to', next step is 'from'
		start = getChipPoint(to, "topCenter");
		end = getChipPoint(from, "bottomCenter");
		horizontalScale = 0;
		verticalScale = -1.5;
	}

	const mx = (start.x + end.x) / 2;
	const my = (start.y + end.y) / 2;
	const horizontalOffset = (start.x - end.x) * horizontalScale;
	const verticalOffset = (start.y - end.y) * verticalScale;
	const cx = mx + horizontalOffset;
	const cy = my + verticalOffset;

	return `M${start.x},${start.y} Q${cx},${cy} ${end.x},${end.y}`;
}

function drawLines(options) {
	// Draws lines/arrows between chips in the graph
	var animate = options && options.animate ? options.animate : false;
	var graphEl = options && options.graphEl ? options.graphEl : null;
	if (!graphEl) {
		return;
	}
	const thisChip = graphEl.querySelector(".chip.this");
	if (!thisChip) {
		return;
	}
	const relatedChips = Array.from(graphEl.querySelectorAll(".chip:not(.this)"));
	const svg = d3.select(graphEl.querySelector(".network-connections"));
	svg.selectAll("path").remove();
	const isPrepare = graphEl.classList.contains('graph-prepare');
	const direction = isPrepare ? "down" : "up";
	if (relatedChips.length === 1) {
		const source = relatedChips[0];
		const target = thisChip;
		svg.append("path")
			.attr("d", curvedPath(source, target, direction))
			.attr("marker-end", "url(#arrowhead)")
			.attr("filter", "url(#handdrawn)");
	} else if (relatedChips.length > 1) {
		relatedChips.forEach(function(related) {
			svg.append("path")
				.attr("d", curvedPath(related, thisChip, direction))
				.attr("filter", "url(#handdrawn)");
		});
		const chipRect = thisChip.getBoundingClientRect();
		const chipsRect = thisChip.parentElement.getBoundingClientRect();
		const x = chipRect.left - chipsRect.left + chipRect.width / 2;
		const y = chipRect.top - chipsRect.top;
		const arrowLength = 24;
		svg.append("path")
			.attr("d", `M${x},${y - arrowLength} L${x},${y}`)
			.attr("marker-end", "url(#arrowhead)")
			.attr("filter", "url(#handdrawn)");
	}
}

// Global state (should be outside so all functions can access)
var currentlyDraggedSlug = null;

// DOMContentLoaded handler

document.addEventListener("DOMContentLoaded", function() {
	setTimeout(function() {
		document.querySelectorAll('.graph').forEach(function(graphEl) {
			const isPrepare = graphEl.classList.contains('graph-prepare');
			const isNext = graphEl.classList.contains('graph-next');
			const chipsContainer = graphEl.querySelector(".chips");
			const prerequisites = Array.from(chipsContainer.querySelectorAll(".chip:not(.this)"));
			const thisChip = chipsContainer.querySelector(".chip.this");

			const data = {
				name: thisChip.dataset.slug,
				chip: thisChip,
				children: prerequisites.map(function(chip) {
					return { name: chip.dataset.slug, chip: chip };
				})
			};

			const root = d3.hierarchy(data);
			const links = root.links();
			const nodes = root.descendants();

			const width = chipsContainer.offsetWidth;
			const height = chipsContainer.offsetHeight;

			const simulation = d3.forceSimulation(nodes)
				.force("link", d3.forceLink(links).id(function(d) { return d.data.name; }).distance(200).strength(0.15))
				.force("charge", d3.forceManyBody().strength(-120))
				.force("customY", d3.forceY(function(d) {
					if (d.data.chip.classList.contains('this')) {
						return isPrepare ? height * 0.25 : height * 0.75;
					} else {
						return isPrepare ? height * 0.75 : height * 0.25;
					}
				}).strength(0.08))
				.force("rectCollide", function() {
					for (var i = 0; i < nodes.length; ++i) {
						for (var j = i + 1; j < nodes.length; ++j) {
							var nodeA = nodes[i], nodeB = nodes[j];
							if (!nodeA.data.chip || !nodeB.data.chip) {
								continue;
							}
							var widthA = nodeA.data.chip.offsetWidth, heightA = nodeA.data.chip.offsetHeight;
							var widthB = nodeB.data.chip.offsetWidth, heightB = nodeB.data.chip.offsetHeight;
							var centerDiffX = nodeA.x - nodeB.x;
							var centerDiffY = nodeA.y - nodeB.y;
							var minAllowedDistX = (widthA + widthB) / 2 + 4; // 4px padding
							var minAllowedDistY = (heightA + heightB) / 2 + heightA;
							if (Math.abs(centerDiffX) < minAllowedDistX && Math.abs(centerDiffY) < minAllowedDistY) {
								// Overlap detected, push apart
								var overlapAmountX = minAllowedDistX - Math.abs(centerDiffX);
								var overlapAmountY = minAllowedDistY - Math.abs(centerDiffY);
								var pushDirectionX = centerDiffX === 0 ? (Math.random() - 0.5) : centerDiffX / Math.abs(centerDiffX);
								var pushDirectionY = centerDiffY === 0 ? (Math.random() - 0.5) : centerDiffY / Math.abs(centerDiffY);
								var verticalPushScale = 1; // adjust for more/less vertical repulsion
								nodeA.x += pushDirectionX * overlapAmountX / 2;
								nodeB.x -= pushDirectionX * overlapAmountX / 2;
								nodeA.y += pushDirectionY * overlapAmountY / 2 * verticalPushScale;
								nodeB.y -= pushDirectionY * overlapAmountY / 2 * verticalPushScale;
							}
						}
					}
				})
				.on("tick", ticked);

			simulation.force("boundingBox", function() {
				nodes.forEach(function(node) {
					if (!node.data.chip) {
						return;
					}
					const chipRect = node.data.chip.getBoundingClientRect();
					const chipsRect = node.data.chip.parentElement.getBoundingClientRect();
					const width = chipsRect.width;
					const height = chipsRect.height;
					const rX = chipRect.width / 2;
					const rY = chipRect.height / 2;
					// Clamp x and y so the chip stays inside the container
					node.x = Math.max(rX, Math.min(width - rX, node.x));
					node.y = Math.max(rY, Math.min(height - rY, node.y));
				});
			});

			function ticked() {
				nodes.forEach(function(node) {
					if (node.data.chip) {
						node.data.chip.style.position = "absolute";
						node.data.chip.style.transform = `translate(${node.x - node.data.chip.offsetWidth / 2}px, ${node.y - node.data.chip.offsetHeight / 2}px)`;
						node.data.chip.dataset.currentLeft = node.x - node.data.chip.offsetWidth / 2;
						node.data.chip.dataset.currentTop = node.y - node.data.chip.offsetHeight / 2;
					}
				});
				drawLines({ animate: false, graphEl: graphEl });

				var debugEnabled = document.getElementById("toggle-debug-arrows")?.checked;
				debugLayer.selectAll("line").remove();

				if (debugEnabled) {
					nodes.forEach(function(node) {
						if (!node.data.chip) {
							return;
						}
						const chipRect = node.data.chip.getBoundingClientRect();
						const chipsRect = node.data.chip.parentElement.getBoundingClientRect();
						const x = chipRect.left - chipsRect.left + chipRect.width / 2;
						const y = chipRect.top - chipsRect.top + chipRect.height / 2;

						// --- Upward force (red) ---
						if (!node.data.chip.classList.contains('this')) {
							const targetY = height * 0.25;
							const fy = (targetY - node.y) * 0.08;
							debugLayer.append("line")
								.attr("x1", x)
								.attr("y1", y)
								.attr("x2", x)
								.attr("y2", y + fy * 20)
								.attr("stroke", "red")
								.attr("stroke-width", 2)
								.attr("marker-end", "url(#arrowhead)");
						}

						// --- Charge force (blue) ---
						// Sum up repulsion from all other nodes
						var fxCharge = 0, fyCharge = 0;
						nodes.forEach(function(other) {
							if (other === node || !other.data.chip) {
								return;
							}
							const dx = node.x - other.x;
							const dy = node.y - other.y;
							const dist2 = dx * dx + dy * dy + 0.01;
							const strength = -200;
							const fx = (dx / Math.sqrt(dist2)) * strength / dist2;
							const fy = (dy / Math.sqrt(dist2)) * strength / dist2;
							fxCharge += fx;
							fyCharge += fy;
							debugLayer.append("line")
								.attr("x1", x)
								.attr("y1", y)
								.attr("x2", x + fx * 200)
								.attr("y2", y + fy * 200)
								.attr("stroke", "cyan")
								.attr("stroke-width", 1)
								.attr("marker-end", "url(#arrowhead)");
						});
						const chargeScale = 20;
						debugLayer.append("line")
							.attr("x1", x)
							.attr("y1", y)
							.attr("x2", x + fxCharge * chargeScale)
							.attr("y2", y + fyCharge * chargeScale)
							.attr("stroke", "blue")
							.attr("stroke-width", 2)
							.attr("marker-end", "url(#arrowhead)");

						// --- Link force (green) ---
						links.forEach(function(link) {
							if (link.target === node) {
								const dx = link.source.x - node.x;
								const dy = link.source.y - node.y;
								const distance = Math.sqrt(dx * dx + dy * dy);
								const desired = 200;
								const strength = 0.15;
								const fxLink = (dx / distance) * (distance - desired) * strength;
								const fyLink = (dy / distance) * (distance - desired) * strength;
								debugLayer.append("line")
									.attr("x1", x)
									.attr("y1", y)
									.attr("x2", x + fxLink * 20)
									.attr("y2", y + fyLink * 20)
									.attr("stroke", "green")
									.attr("stroke-width", 2)
									.attr("marker-end", "url(#arrowhead)");
							}
						});

						// --- RectCollide force (orange) ---
						// This is trickier, but you can visualize the last overlap push
						// (Optional: store the last overlap vector in the rectCollide force and use it here)
					});
				}
			}

			// Fix .this chip at the appropriate vertical position
			const thisNode = nodes.find(function(n) {
				return n.data.chip.classList.contains('this');
			});
			thisNode.fx = width / 2;
			if (isPrepare) {
				thisNode.fy = height * 0.25;
			} else {
				thisNode.fy = height * 0.75;
			}

			simulation.alpha(1).restart();

			d3.selectAll(graphEl.querySelectorAll(".chip")).call(
				d3.drag()
					.on("start", function(event, d) {
						const node = nodes.find(function(n) { return n.data.chip === this; }, this);
						simulation.alphaTarget(0.1).restart();
						node.fx = node.x;
						node.fy = node.y;
						d3.select(this).classed("dragging", true);
					})
					.on("drag", function(event, d) {
						const node = nodes.find(function(n) { return n.data.chip === this; }, this);
						node.fx = event.x;
						node.fy = event.y;
					})
					.on("end", function(event, d) {
						const node = nodes.find(function(n) { return n.data.chip === this; }, this);
						simulation.alphaTarget(0);
						node.fx = null;
						node.fy = null;
						d3.select(this).classed("dragging", false);
						if (node.data.chip.classList.contains('this')) {
							node.fx = null;
							node.fy = height * 0.85;
						}
					})
			);

			// Add marker if not present
			const svg = d3.select(graphEl.querySelector(".network-connections"));
			let defs = svg.select("defs");
			if (defs.empty()) {
				defs = svg.append("defs");
			}
			defs.selectAll("marker#arrowhead").data([null]).join("marker")
				.attr("id", "arrowhead")
				.attr("markerWidth", 8)
				.attr("markerHeight", 8)
				.attr("refX", 4)
				.attr("refY", 4)
				.attr("orient", "auto")
				.attr("markerUnits", "strokeWidth")
				.html('<path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor"/>');

			let debugLayer = svg.select("g.debug-arrows");
			if (debugLayer.empty()) {
				debugLayer = svg.append("g").attr("class", "debug-arrows");
			}

			drawLines({ animate: true, graphEl: graphEl });
		});
	}, 0);
});