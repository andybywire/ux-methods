// Helper Functions

function getChipCenter(chip) {
  const chipRect = chip.getBoundingClientRect();
  const chipsRect = chip.parentElement.getBoundingClientRect(); // .chips, not .graph
  console.log(`Chip (${chip.dataset.slug}):`, chipRect);
  console.log('Chips container:', chipsRect);
  return {
    x: chipRect.left - chipsRect.left + chipRect.width / 2,
    y: chipRect.top - chipsRect.top + chipRect.height / 2
  };
}

function drawChipLines({ animate = false } = {}) {
  const chips = d3.selectAll(".graph .chips .chip").nodes();
  const pairs = [];
  for (let i = 0; i < chips.length; i++) {
    for (let j = i + 1; j < chips.length; j++) {
      pairs.push({ source: chips[i], target: chips[j] });
    }
  }
  const svg = d3.select(".network-connections");
  const lines = svg.selectAll("line").data(pairs, d => d.source.dataset.slug + "-" + d.target.dataset.slug);

  // Enter
  const linesEnter = lines.enter()
    .append("line");

  // Set initial positions for new lines
  linesEnter
    .attr("x1", d => getChipCenter(d.source).x)
    .attr("y1", d => getChipCenter(d.source).y)
    .attr("x2", d => getChipCenter(d.target).x)
    .attr("y2", d => getChipCenter(d.target).y);

  // Update
  const linesUpdate = animate
    ? lines.transition().duration(350)
    : lines;

  linesUpdate
    .attr("x1", d => getChipCenter(d.source).x)
    .attr("y1", d => getChipCenter(d.source).y)
    .attr("x2", d => getChipCenter(d.target).x)
    .attr("y2", d => getChipCenter(d.target).y);

  // Exit
  lines.exit().remove();
}

function drawPrerequisiteLines({ animate = false } = {}) {
  const thisChip = document.querySelector(".graph .chips .chip.this");
  if (!thisChip) return;

  // Select all chips except the current one
  const prerequisites = Array.from(document.querySelectorAll(".graph .chips .chip:not(.this)"));

  // Build pairs: each prerequisite points to the current chip
  const pairs = prerequisites.map(prereq => ({
    source: prereq,
    target: thisChip
  }));

  const svg = d3.select(".network-connections");
  const lines = svg.selectAll("line").data(pairs, d => d.source.dataset.slug + "-" + d.target.dataset.slug);

  // Enter
  const linesEnter = lines.enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2);

  linesEnter
    .attr("x1", d => getChipCenter(d.source).x)
    .attr("y1", d => getChipCenter(d.source).y)
    .attr("x2", d => getChipCenter(d.target).x)
    .attr("y2", d => getChipCenter(d.target).y);

  // Update
  const linesUpdate = animate
    ? lines.transition().duration(350)
    : lines;

  linesUpdate
    .attr("x1", d => getChipCenter(d.source).x)
    .attr("y1", d => getChipCenter(d.source).y)
    .attr("x2", d => getChipCenter(d.target).x)
    .attr("y2", d => getChipCenter(d.target).y);

  // Exit
  lines.exit().remove();
}

// Global state (should be outside so all functions can access)
let currentlyDraggedSlug = null;

// DOMContentLoaded handler
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const chipsContainer = document.querySelector(".graph .chips");
    const containerRect = chipsContainer.getBoundingClientRect();

    const chips = d3.selectAll(".graph .chips .chip");

    // First, collect all positions
    const positions = [];
    chips.each(function () {
      const rect = this.getBoundingClientRect();
      const relLeft = rect.left - containerRect.left;
      const relTop = rect.top - containerRect.top;
      positions.push({ el: this, relLeft, relTop });
    });

    // Now, set absolute positioning and transform
    positions.forEach(({ el, relLeft, relTop }) => {
      el.style.position = "absolute";
      el.style.transform = `translate(${relLeft}px, ${relTop}px)`;
      el.dataset.origLeft = relLeft;
      el.dataset.origTop = relTop;
      // Optionally, log it
      console.log(el.dataset.slug, relLeft, relTop);
    });

    // Example: Add a hover effect
    chips
      .on("mouseover", function () {
        d3.select(this).classed("highlight", true);
      })
      .on("mouseout", function () {
        d3.select(this).classed("highlight", false);
      });

    // D3 drag behavior
    let offsetX = 0, offsetY = 0;
    let dragTimeout = null;
    let dragging = false;

    const dragDelay = 300; // ms

    const drag = d3.drag()
      .on("start", function (event) {
        dragging = false;
        const chip = d3.select(this);
        offsetX = event.x - parseFloat(this.dataset.origLeft);
        offsetY = event.y - parseFloat(this.dataset.origTop);

        // Start a timer to enable dragging after a delay
        dragTimeout = setTimeout(() => {
          dragging = true;
          chip.raise().classed("dragging", true);
          // Add the class to .graph when drag actually starts
          document.querySelector('.graph').classList.add('dragging');
          currentlyDraggedSlug = this.dataset.slug;
        }, dragDelay);
      })
      .on("drag", function (event) {
        if (!dragging) {
          // If the user moves before the delay, start dragging immediately
          clearTimeout(dragTimeout);
          dragging = true;
          d3.select(this).raise().classed("dragging", true);
          // Add the class to .graph if drag starts by movement
          document.querySelector('.graph').classList.add('dragging');
        }
        const x = event.x - offsetX;
        const y = event.y - offsetY;
        d3.select(this).style(
          "transform",
          `translate(${x}px, ${y}px)`
        );
        this.dataset.currentLeft = x;
        this.dataset.currentTop = y;

        drawChipLines({ animate: false });
      })
      .on("end", function () {
        clearTimeout(dragTimeout);
        d3.select(this)
          .classed("dragging", false)
          .classed("highlight", false);
        dragging = false;
        document.querySelector('.graph').classList.remove('dragging');
        currentlyDraggedSlug = null;

        animateChipToOrigin(this, 350, d3.easeCubic);
      });

    chips.call(drag);

    // You can now use these positions to draw lines, overlays, etc.

    const graph = document.querySelector('.graph');
    graph.classList.add('d3-ready');
    requestAnimationFrame(() => {
      setTimeout(() => {
        graph.classList.remove('no-transition');
      }, 50); // 50ms after the next paint
    });

    const svg = document.querySelector(".network-connections");
    if (!svg) {
      console.error("SVG element with class .network-connections not found!");
      return;
    }

    drawChipLines({ animate: true });
  }, 0);
});

window.addEventListener("load", () => {
  // ... your code here ...
});

function animateChipToOrigin(chip, duration = 350, ease = d3.easeCubic) {
  const startLeft = parseFloat(chip.dataset.currentLeft);
  const startTop = parseFloat(chip.dataset.currentTop);
  const endLeft = parseFloat(chip.dataset.origLeft);
  const endTop = parseFloat(chip.dataset.origTop);

  const startTime = performance.now();

  function animate(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = ease(t);

    const x = startLeft + (endLeft - startLeft) * eased;
    const y = startTop + (endTop - startTop) * eased;

    chip.style.transform = `translate(${x}px, ${y}px)`;
    chip.dataset.currentLeft = x;
    chip.dataset.currentTop = y;

    drawChipLines({ animate: false }); // Instantly update lines

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // Ensure final position is exact
      chip.style.transform = `translate(${endLeft}px, ${endTop}px)`;
      chip.dataset.currentLeft = endLeft;
      chip.dataset.currentTop = endTop;
      drawChipLines({ animate: false });
    }
  }

  requestAnimationFrame(animate);
}