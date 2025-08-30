# Custom Dropdown — React + TypeScript (CSS Modules)

Reusable, accessible dropdown component built from scratch (no UI libraries).
As per the test brief — functionality over design, clean API, and a demo page to validate scenarios.


> Repository: https://github.com/Markian-code/react-custom-dropdown

---

## Highlights

- Open on click or focus (Tab); second click closes
- Close on outside click, Esc, focus loss (Tab), and when another dropdown opens
- Keyboard support: ArrowUp/Down to navigate, Enter to select
- Built-in search (by label) and custom/async search via `searchFn`
- Custom renderers: `renderItem` (list item), `renderSelected` (button view)
- Fully typed generic API `<T>`; no dropdown libraries
- Styling via CSS Modules; responsive demo layout

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173

# production
npm run build
npm run preview    # serves dist

# quality (if enabled)
npm run lint
npm run typecheck
```

---

## Usage

### Basic

```tsx
import { useState } from 'react';
import { CustomDropdown } from './components/CustomDropdown/CustomDropdown';

type City = { id: number; name: string };
const CITIES: City[] = [{ id:1, name:'Kyiv' }, { id:2, name:'Lviv' }];

export default function Example() {
  const [value, setValue] = useState<City | null>(null);

  return (
    <CustomDropdown<City>
      items={CITIES}
      value={value}
      onChange={setValue}
      placeholder="Оберіть ваше місто"
      getLabel={(c) => c.name}
    />
  );
}
```

### Custom list items (`renderItem`) and custom selected view (`renderSelected`)

```tsx
<CustomDropdown<City>
  items={CITIES}
  value={value}
  onChange={setValue}
  getLabel={(c) => c.name}
  renderSelected={(val) =>
    val ? (
      <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
        <span style={{ width:8, height:8, borderRadius:9999, background:'#9ca3af' }} />
        {val.name}
      </span>
    ) : 'Select...'
  }
  renderItem={({ item, selected }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span
        style={{
          width:8, height:8, borderRadius:9999,
          background: selected ? '#3b82f6' : '#d1d5db'
        }}
      />
      {(item as City).name}
      {selected && <span style={{ marginLeft:'auto', fontSize:12, color:'#6b7280' }}>(selected)</span>}
    </div>
  )}
/>
```

### Async search (`searchFn`)

```tsx
async function serverSearch(query: string, items: City[]) {
  await new Promise(r => setTimeout(r, 300)); // simulate latency
  const q = query.toLowerCase();
  return items.filter(c => c.name.toLowerCase().includes(q));
}

<CustomDropdown<City>
  items={CITIES}
  value={value}
  onChange={setValue}
  getLabel={(c) => c.name}
  searchable
  searchFn={serverSearch}
/>
```

---

## Component API (TypeScript)

```ts
export type RenderItemProps<T> = {
  item: T;
  index: number;
  active: boolean;   // highlighted by keyboard/hover
  selected: boolean; // equals current value
};

export type CustomDropdownProps<T> = {
  items: T[];
  value: T | null;
  onChange: (val: T) => void;

  placeholder?: string;
  getLabel?: (item: T) => string;

  renderItem?: (p: RenderItemProps<T>) => React.ReactNode;
  renderSelected?: (value: T | null) => React.ReactNode;

  // search
  searchable?: boolean;                 // default: true
  searchPlaceholder?: string;           // default: 'Пошук...'
  searchFn?: (query: string, items: T[]) => Promise<T[]> | T[];

  // behaviour
  disabled?: boolean;                   // default: false
  closeOnSelect?: boolean;              // default: true

  // styling hooks
  className?: string;
  dropdownClassName?: string;
};
```

---

## Keyboard and accessibility

- Open: Enter, Space, ArrowDown (when closed); Tab focus opens (only keyboard focus is considered)
- Navigate: ArrowUp / ArrowDown
- Select: Enter
- Close: Esc, outside click, focus leaves component (Tab), another dropdown opens

Accessibility notes:
- Button has `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`
- Options have `role="option"` and `aria-selected`
- Focus management: after close (Esc/select) focus returns to the button without re-opening (suppressed once)

---

## Architecture

- Controlled component: `value` + `onChange`
- Generic `<T>`: data-agnostic; label via `getLabel`
- Search: debounced; default by label; optional `searchFn` (supports async)
- Open groups: when one dropdown opens, it emits a document event; others close
- Outside click: custom `useOutsideClick` bound to the root (button + panel) to avoid toggle race
- Focus logic:
  - `onBlurCapture` closes when focus leaves the root (Tab)
  - Esc flicker fixed by suppressing one focus-open after programmatic focus

Key files:
```
src/components/CustomDropdown/
  ├─ CustomDropdown.tsx
  ├─ CustomDropdown.module.css
  └─ types.ts
src/pages/
  ├─ DemoPage.tsx
  └─ DemoPage.module.css
src/utils/useOutsideClick.ts
```

---

## Styling

- Pure CSS Modules (no Tailwind / no UI libraries)
- Responsive demo layout: 3 → 2 → 1 columns depending on viewport
- Panel width: at least the button width, with a sensible max

---

## Project structure

```
src/
  components/
    CustomDropdown/
      CustomDropdown.tsx
      CustomDropdown.module.css
      types.ts
  pages/
    DemoPage.tsx
    DemoPage.module.css
  utils/
    useOutsideClick.ts
  index.css
  main.tsx
  App.tsx
vite.config.ts
index.html
```

---

## Decisions and trade-offs

- No UI libraries to keep behaviour explicit and satisfy the task
- CSS Modules over utility frameworks to keep bundle lean and styles portable
- Event bus (`OPEN_EVENT`) for coordinating multiple instances with minimal coupling
- Selection equality based on label; in real apps you can expose `isEqual(a,b)` or `keyExtractor(item)`

---

## Possible improvements

- More accessibility: `aria-labelledby`, `aria-activedescendant`, unique IDs per option
- `isEqual(a,b)` / `keyExtractor(item)` to avoid relying on label uniqueness
- Auto-scroll active item into view on keyboard navigation
- Unit tests (Vitest + React Testing Library)
- Virtualized list for thousands of items

---

## License

MIT — feel free to use for learning and interviews.
