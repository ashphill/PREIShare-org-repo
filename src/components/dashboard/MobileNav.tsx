import { NavItems } from '../layout/NavItems'

type MobileNavProps = {
  /** Whether the menu panel is showing */
  open: boolean
  /** Runs when the menu button is tapped (opens or closes the panel) */
  onToggle: () => void
}

const MENU_ID = 'mobile-dashboard-menu'

/**
 * Small-screen navigation: a labeled menu button plus a panel with the same
 * links as Sidebar (shared list in src/components/layout/navConfig.ts).
 * Only visible below 768px. AppShell owns the open state and closes the
 * panel after the investor picks a page.
 */
export function MobileNav({ open, onToggle }: MobileNavProps) {
  return (
    <div className="dash-mobile-nav">
      <button
        type="button"
        className="dash-menu-toggle"
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={onToggle}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        <span>{open ? 'Close menu' : 'Open menu'}</span>
      </button>
      {open ? (
        <div id={MENU_ID} className="dash-mobile-panel">
          <NavItems />
        </div>
      ) : null}
    </div>
  )
}
