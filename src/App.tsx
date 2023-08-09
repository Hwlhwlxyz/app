import './App.scss'

import { useEffect, useMemo, useState } from 'react'
import type { definePlugin } from '@power-playground/core'
import {
  createQuickAccessInstance,
  EditorZone,
  elBridgeP,
  QuickAccess,
  QuickAccessContext
} from '@power-playground/core'

import { ThemeSwitcher } from './components/ThemeSwitcher.tsx'

const plugins = import.meta
  .glob(['./plugins/*.ts', './plugins/*/index.ts'], {
    import: 'default'
  }) as Record<string, () => Promise<ReturnType<typeof definePlugin>>>

export function App() {
  useEffect(() => onThemeChange(theme => elBridgeP.send('update:localStorage', ['uiTheme', {
    light: 'default', dark: 'dark'
  }[theme]])), [])

  const [dockTo, setDockTo] = useState('right')
  useEffect(() => elBridgeP.on('dock-to', setDockTo), [])
  const resizable = useMemo(() => ({ [dockTo]: true } as {
    [K in 'left' | 'right' | 'bottom']?: boolean
  }), [dockTo])

  return (
    <>
      <header>
        <h1 style={{ margin: 0 }}>
          <a href='https://github.com/power-playground/app'
             target='_blank'
             style={{
              color: '#fff',
              textDecoration: 'none'
            }} rel='noreferrer'
          >
            Power Playground
          </a>
        </h1>
        <ThemeSwitcher />
      </header>
      <div className={`main ${dockTo}`}>
        <QuickAccessContext.Provider value={createQuickAccessInstance()}>
          <QuickAccess />
          <EditorZone
            resizable={resizable}
            style={{
              '--editor-width': dockTo === 'bottom' ? '100%' : '50%',
              '--editor-height': dockTo === 'bottom' ? '50%' : '100%'
            }}
          />
          <iframe
            ref={ele => {
              if (!ele) return

              // @ts-ignore
              ele.contentWindow!.PPD_PLUGINS = plugins
            }}
            src='./eval-logs.html'
            frameBorder={0}
            className='eval-logs'
          />
        </QuickAccessContext.Provider>
      </div>
    </>
  )
}
