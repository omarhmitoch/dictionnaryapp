import React from 'react'
import searchIcon from "../assets/images/icon-search.svg"

type InputProps = {
	onError: boolean
	value: string
	onChange: (val: string) => void
}

function Input(props: InputProps) {
	return (
		<div className={`inputWrapper ${props.onError ? "error": ""}`}>
			<input
				type="text"
				className='input' 
				placeholder='Search for any word'
				value={props.value}
				onChange={(e)=> props.onChange(e.target.value)}
			/>
			<span className='searchIcon'><img src={searchIcon} alt="" /></span>
			{props.onError && <span className='errorMessage'>Whoops, can’t be empty…</span>}
		</div>
	)
}

export default Input