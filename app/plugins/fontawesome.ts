import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faHouse,
  faMusic,
  faVideo,
  faMagnifyingGlass,
  faList,
  faCircleInfo,
  faPlay,
  faPause,
  faBackwardStep,
  faForwardStep,
  faShuffle,
  faRepeat,
  faArrowRotateRight,
  faBars,
  faXmark,
  faGripVertical,
  faVolumeHigh,
  faVolumeXmark,
  faPlus,
  faBookmark,
  faCheck,
  faChevronRight,
  faChevronLeft,
  faTrash,
  faAnglesRight,
  faLink,
  faEnvelope,
  faStar,
  faArrowUpRightFromSquare,
  faGear,
} from '@fortawesome/free-solid-svg-icons'
import { faYoutube, faXTwitter } from '@fortawesome/free-brands-svg-icons'

// Prevent double CSS loading — managed via nuxt.config.ts css[]
config.autoAddCss = false

library.add(
  faHouse,
  faMusic,
  faVideo,
  faMagnifyingGlass,
  faList,
  faCircleInfo,
  faPlay,
  faPause,
  faBackwardStep,
  faForwardStep,
  faShuffle,
  faRepeat,
  faArrowRotateRight,
  faBars,
  faXmark,
  faGripVertical,
  faVolumeHigh,
  faVolumeXmark,
  faPlus,
  faBookmark,
  faCheck,
  faChevronRight,
  faChevronLeft,
  faTrash,
  faAnglesRight,
  faLink,
  faEnvelope,
  faStar,
  faArrowUpRightFromSquare,
  faGear,
  // Brands
  faYoutube,
  faXTwitter,
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
