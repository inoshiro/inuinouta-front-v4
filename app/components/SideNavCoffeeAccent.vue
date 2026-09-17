<template>
  <div class="coffee-accent hidden shrink-0 items-center justify-center py-4 lg:flex">
    <svg
      class="cup"
      viewBox="0 0 200 200"
      width="160"
      height="160"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path
          id="sidenav-coffee-handle-shape"
          fill-rule="evenodd"
          d="M128 80
             C148 72 172 76 172 94
             C172 110 156 120 128 128 Z
             M140 88
             C152 84 162 86 162 95
             C162 104 152 110 140 114
             C136 106 136 94 140 88 Z"
        />
      </defs>

      <!-- Back handle (drawn first so the body silhouette can cover it) -->
      <g class="handle handle--back fill-gray-600">
        <use href="#sidenav-coffee-handle-shape" />
      </g>

      <!-- Cup body: saucer + body + rim as one silhouette -->
      <g class="fill-gray-600">
        <ellipse cx="100" cy="150" rx="46" ry="8" />
        <ellipse cx="100" cy="144" rx="66" ry="11" />
        <path
          d="M60 74
             C60 108 63 128 74 137
             Q80 142 88 142
             L112 142
             Q120 142 126 137
             C137 128 140 108 140 74 Z"
        />
        <ellipse cx="100" cy="74" rx="40" ry="9" />
      </g>

      <!-- Front handle (only visible while facing the viewer) -->
      <g class="handle handle--front fill-gray-600">
        <use href="#sidenav-coffee-handle-shape" />
      </g>

      <!-- Steam: 3 "fuwamaru" puffs on the same S-curve, 3s apart, 9s linear loop -->
      <g class="steam fill-gray-500">
        <path class="steam-blob steam-blob--a" :d="steamShapes[0]">
          <animate
            attributeName="d"
            dur="9s"
            begin="0s"
            repeatCount="indefinite"
            calcMode="linear"
            :keyTimes="steamKeyTimes"
            :values="steamShapeValues"
          />
        </path>
        <path class="steam-blob steam-blob--b" :d="steamShapes[0]">
          <animate
            attributeName="d"
            dur="9s"
            begin="-3s"
            repeatCount="indefinite"
            calcMode="linear"
            :keyTimes="steamKeyTimes"
            :values="steamShapeValues"
          />
        </path>
        <path class="steam-blob steam-blob--c" :d="steamShapes[0]">
          <animate
            attributeName="d"
            dur="9s"
            begin="-6s"
            repeatCount="indefinite"
            calcMode="linear"
            :keyTimes="steamKeyTimes"
            :values="steamShapeValues"
          />
        </path>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
// "Fuwamaru" steam puff outlines to morph between (same command structure: M + 5x C + Z)
const steamShapes = [
  'M83 65 C80 59 86 53 93 52 C96 46 106 45 111 50 C118 50 123 57 121 64 C124 70 116 74 106 73 C98 76 87 73 83 65 Z',
  'M81 63 C82 56 88 52 95 53 C99 46 109 47 113 52 C121 51 125 59 122 66 C120 73 111 73 103 72 C94 75 82 71 81 63 Z',
  'M85 67 C80 62 84 55 91 53 C94 47 104 46 109 51 C117 48 123 55 121 62 C126 68 119 74 110 73 C101 76 89 74 85 67 Z',
]

// Hold shape 0 while fading in, morph through 1 and 2 while rising, hold 2 while fading out
const steamKeyTimes = '0;0.2;0.478;0.744;1'
const steamShapeValues = [
  steamShapes[0],
  steamShapes[0],
  steamShapes[1],
  steamShapes[2],
  steamShapes[2],
].join(';')
</script>

<style scoped>
/* Registers --sidenav-coffee-angle as an animatable <angle> for the handle transforms */
@property --sidenav-coffee-angle {
  syntax: '<angle>';
  inherits: true;
  initial-value: 270deg;
}

.cup {
  overflow: visible;
  animation: sidenav-coffee-spin 8s linear infinite;
}

@keyframes sidenav-coffee-spin {
  from {
    --sidenav-coffee-angle: 270deg;
  }
  to {
    --sidenav-coffee-angle: -90deg;
  }
}

/* x = center + r·sin(angle) → scaleX(sin(angle)) fakes the turntable rotation */
.handle {
  transform-box: view-box;
  transform-origin: 100px 0;
  transform: scaleX(sin(var(--sidenav-coffee-angle)));
}

.handle--front {
  opacity: clamp(0, cos(var(--sidenav-coffee-angle)) * 3, 1);
}

.steam-blob {
  transform-box: fill-box;
  transform-origin: center;
  animation: sidenav-coffee-steam-rise 9s linear infinite;
}

.steam-blob--a {
  animation-delay: 0s;
}

.steam-blob--b {
  animation-delay: -3s;
}

.steam-blob--c {
  animation-delay: -6s;
}

/* Single shared S-curve: same trajectory for all 3 puffs, only phase-shifted by delay */
@keyframes sidenav-coffee-steam-rise {
  0% {
    transform: translate(0px, 8px) scale(0.38);
    opacity: 0;
  }
  20% {
    transform: translate(-5px, -8px) scale(0.58);
    opacity: 0.29;
  }
  47.8% {
    transform: translate(6px, -28px) scale(0.8);
    opacity: 0.29;
  }
  74.4% {
    transform: translate(-4px, -48px) scale(0.94);
    opacity: 0.21;
  }
  100% {
    transform: translate(2px, -68px) scale(0.98);
    opacity: 0;
  }
}

/* Hide on short viewports so nav links stay reachable without scrolling */
@media (max-height: 640px) {
  .coffee-accent {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cup {
    animation: none;
  }

  .steam {
    display: none;
  }
}
</style>
