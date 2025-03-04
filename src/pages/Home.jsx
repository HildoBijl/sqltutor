import { useState, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { basicSetup } from 'codemirror'

import { DatabaseTest } from '../DatabaseTest'

import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

export function Home() {
	const initialValue = 'SELECT * FROM users'
	const [value, setValue] = useState(initialValue)
	const onChange = useCallback(value => setValue(value), [])

	return <>
	<div>
		<a href="https://vite.dev" target="_blank">
			<img src={viteLogo} className="logo" alt="Vite logo" />
		</a>
		<a href="https://react.dev" target="_blank">
			<img src={reactLogo} className="logo react" alt="React logo" />
		</a>
	</div>

	<h1>SQL-Tutor</h1>
	<CodeMirror value={value} height="200px" extensions={[basicSetup, sql()]} onChange={onChange} />

	<h4>Results</h4>
	<DatabaseTest query={value} />
	</>
}
