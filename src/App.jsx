import { useState, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import React from 'react';
import CodeMirror from '@uiw/react-codemirror'
import {sql} from '@codemirror/lang-sql'
import {basicSetup} from 'codemirror'

import { DatabaseTest } from './DatabaseTest'

function App() {
  const [count, setCount] = useState(0)


  const [value, setValue] = useState("SELECT * FROM users");
  const onChange = useCallback((val, viewUpdate) => {
    console.log('val:', val);
    setValue(val);
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <DatabaseTest query={value} />
      <h1>SQL-Tutor</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <CodeMirror value={value} height="200px" extensions={[basicSetup, sql()]} onChange={onChange} />
      <p>Your input is: {value}</p>
    </>
  )
}

export default App
