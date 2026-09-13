import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'

// worktrees/* are separate git worktrees for other in-progress issues; each has
// its own tooling and may lack a built .nuxt/, so never lint them from here.
export default withNuxt(eslintPluginPrettier, { ignores: ['worktrees/**'] })
