import { useState } from 'react'
import { CustomDropdown } from '../components/CustomDropdown/CustomDropdown'
import styles from './DemoPage.module.css'

type City = { id: number; name: string }

const CITIES: City[] = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
  { id: 4, name: 'Kyiv' },
  { id: 5, name: 'Lviv' },
  { id: 6, name: 'Odesa' },
  { id: 7, name: 'Kharkiv' },
]

// серверний пошук
async function fakeServerSearch(q: string, items: City[]): Promise<City[]> {
  await new Promise((r) => setTimeout(r, 300))
  const n = q.toLowerCase()
  return items.filter((c) => c.name.toLowerCase().includes(n))
}

export default function DemoPage() {
  const [v1, setV1] = useState<City | null>(null)
  const [v2, setV2] = useState<City | null>(null)
  const [v3, setV3] = useState<City | null>(CITIES[0])

  return (
    <div className={styles.page}>
      <div className={styles.title}>Dropdown</div>
      <div className={styles.card}>
        <div className={styles.col}>
          <CustomDropdown
            items={CITIES}
            value={v1}
            onChange={setV1}
            placeholder="Оберіть ваше місто"
            getLabel={(c) => c.name}
          />
        </div>

        <div className={styles.col}>
          <CustomDropdown
            items={CITIES}
            value={v2}
            onChange={setV2}
            placeholder="Оберіть ваше місто"
            getLabel={(c) => c.name}
          />
        </div>

        <div className={styles.col}>
          <CustomDropdown
            items={CITIES}
            value={v3}
            onChange={setV3}
            getLabel={(c) => c.name}
            searchable
            searchFn={(q, items) => fakeServerSearch(q, items as City[])}
            renderSelected={(val) =>
              val ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-block', width: 8, height: 8,
                      borderRadius: 9999, background: '#9ca3af'
                    }}
                  />
                  {val.name}
                </span>
              ) : (
                'Select...'
              )
            }
            renderItem={({ item, selected }) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: 9999,
                    background: selected ? '#3b82f6' : '#d1d5db'
                  }}
                />
                <span>{(item as City).name}</span>
                {selected && (
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
                    (вибрано)
                  </span>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
